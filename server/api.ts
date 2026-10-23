import { Hono, type Context } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { compress } from 'hono/compress';
import {
  MAX_FORM_AGE_MS,
  MIN_FILL_MS,
  parseEnquiry,
  type EnquiryResponse,
} from '../src/shared/enquiry';
import type { ServerConfig } from './config';
import { composeEnquiryMail, type Mailer } from './mailer';
import { IdempotencyCache, RateLimiter } from './rateLimit';
import { httpsRedirect, securityHeaders } from './security';

/**
 * The enquiry API. Platform-neutral: uses only Web APIs, so the same app runs on the Node
 * server (`server/app.ts`) and on Cloudflare Workers (`worker/index.ts`).
 */
export interface ApiOptions {
  config: ServerConfig;
  mailer: Mailer | null;
  /** Returns the connecting client's IP when the platform exposes it (used for rate limiting). */
  remoteAddress?: (c: Context) => string | undefined;
  /** Compress responses in-app (Node). Off on Cloudflare, which compresses at the edge. */
  compress?: boolean;
  now?: () => number;
  log?: (event: Record<string, unknown>) => void;
}

function newReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `BT-${hex.toUpperCase()}`;
}

function clientIp(
  c: Context,
  trustProxy: boolean,
  remoteAddress: (c: Context) => string | undefined,
): string {
  if (trustProxy) {
    // Cloudflare sets CF-Connecting-IP; otherwise the right-most X-Forwarded-For entry is the
    // one appended by our own proxy.
    const cf = c.req.header('cf-connecting-ip');
    if (cf) return cf;
    const forwarded = c.req
      .header('x-forwarded-for')
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const ip = forwarded?.at(-1);
    if (ip) return ip;
  }
  return remoteAddress(c) ?? 'unknown';
}

function json(c: Context, status: 200 | 400 | 403 | 415 | 429 | 500 | 503, body: EnquiryResponse) {
  c.header('Cache-Control', 'no-store');
  return c.json(body, status);
}

export function createApiApp(options: ApiOptions) {
  const { config, mailer } = options;
  const remoteAddress = options.remoteAddress ?? (() => undefined);
  const now = options.now ?? Date.now;
  const log = options.log ?? ((event) => console.log(JSON.stringify(event)));
  const perIp = new RateLimiter(config.rateLimit.max, config.rateLimit.windowMs, now);
  const global = new RateLimiter(config.rateLimit.globalPerHour, 60 * 60_000, now);
  const completed = new IdempotencyCache(15 * 60_000, now);

  const app = new Hono();
  app.use('*', httpsRedirect(config));
  app.use('*', securityHeaders(config));
  if (options.compress ?? true) app.use('*', compress());

  app.get('/api/health', (c) => {
    c.header('Cache-Control', 'no-store');
    return c.json({ ok: true, mail: mailer ? 'configured' : 'not_configured' });
  });

  app.post(
    '/api/enquiry',
    bodyLimit({
      maxSize: 16 * 1024,
      onError: (c) =>
        json(c, 400, {
          ok: false,
          code: 'validation',
          message: 'Your message is too large to send.',
        }),
    }),
    async (c) => {
      // Same-origin enforcement. The API uses no cookies, so this is defence in depth
      // against cross-site form abuse rather than session CSRF.
      const origin = c.req.header('origin');
      const sameHost = origin && new URL(c.req.url).origin === origin;
      if (config.env === 'production' || origin) {
        if (!origin || (!config.allowedOrigins.includes(origin) && !sameHost)) {
          return json(c, 403, { ok: false, code: 'rejected', message: 'Request not permitted.' });
        }
      }
      if (!c.req.header('content-type')?.toLowerCase().startsWith('application/json')) {
        return json(c, 415, {
          ok: false,
          code: 'rejected',
          message: 'Unsupported request format.',
        });
      }

      const ip = clientIp(c, config.trustProxy, remoteAddress);
      const limit = perIp.check(ip);
      const globalLimit = global.check('global');
      if (!limit.allowed || !globalLimit.allowed) {
        const retryAfterSeconds = Math.max(limit.retryAfterSeconds, globalLimit.retryAfterSeconds);
        c.header('Retry-After', String(retryAfterSeconds));
        log({ event: 'enquiry_rate_limited' });
        return json(c, 429, {
          ok: false,
          code: 'rate_limited',
          message: 'Too many enquiries were sent from your connection. Please try again later.',
          retryAfterSeconds,
        });
      }

      let body: unknown;
      try {
        body = await c.req.json();
      } catch {
        return json(c, 400, {
          ok: false,
          code: 'validation',
          message: 'The request could not be read.',
        });
      }

      const parsed = parseEnquiry(body);
      if (!parsed.success) {
        const fields = parsed.errors;
        // A filled honeypot or malformed timestamp indicates automation: reject without detail.
        if (fields.website || fields.startedAt || fields.kind) {
          log({ event: 'enquiry_rejected', reason: 'automation_signal' });
          return json(c, 400, {
            ok: false,
            code: 'rejected',
            message: 'Your enquiry could not be accepted.',
          });
        }
        return json(c, 400, {
          ok: false,
          code: 'validation',
          message: 'Please correct the highlighted fields.',
          fields,
        });
      }
      const enquiry = parsed.data;

      const age = now() - enquiry.startedAt;
      if (age < MIN_FILL_MS || age > MAX_FORM_AGE_MS) {
        log({ event: 'enquiry_rejected', reason: age < MIN_FILL_MS ? 'too_fast' : 'stale' });
        return json(c, 400, {
          ok: false,
          code: 'rejected',
          message:
            age > MAX_FORM_AGE_MS
              ? 'This form has expired. Please reload the page and try again.'
              : 'Your enquiry could not be accepted. Please wait a moment and try again.',
        });
      }

      const idempotencyKey = c.req.header('idempotency-key');
      const validKey =
        idempotencyKey && /^[A-Za-z0-9-]{16,64}$/.test(idempotencyKey) ? idempotencyKey : undefined;
      const previous = validKey ? completed.get(validKey) : undefined;
      if (previous) return json(c, 200, { ok: true, reference: previous });

      if (!mailer || config.mail.transport === 'disabled') {
        log({ event: 'enquiry_unavailable' });
        return json(c, 503, {
          ok: false,
          code: 'unavailable',
          message: 'Online enquiries are temporarily unavailable. Please contact us directly.',
        });
      }

      const reference = newReference();
      try {
        await mailer.send(
          composeEnquiryMail(enquiry, reference, { from: config.mail.from, to: config.mail.to }),
        );
      } catch (error) {
        // Log the failure class only — never the enquiry contents or credentials.
        log({ event: 'enquiry_delivery_failed', reference, error: (error as Error).name });
        return json(c, 503, {
          ok: false,
          code: 'unavailable',
          message: 'We could not send your enquiry just now. Please try again in a few minutes.',
        });
      }

      if (validKey) completed.set(validKey, reference);
      log({ event: 'enquiry_delivered', reference, kind: enquiry.kind, transport: mailer.name });
      return json(c, 200, { ok: true, reference });
    },
  );

  app.all('/api/*', (c) => c.json({ ok: false, message: 'Not found' }, 404));

  app.onError((error, c) => {
    log({ event: 'unhandled_error', error: error.name });
    return c.text('Something went wrong.', 500);
  });

  return app;
}
