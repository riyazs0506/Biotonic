import { randomBytes } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { getConnInfo } from '@hono/node-server/conninfo';
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

export interface AppOptions {
  config: ServerConfig;
  mailer: Mailer | null;
  /** Directory containing the prerendered site (dist/client). Omit for API-only mode. */
  staticRoot?: string;
  now?: () => number;
  log?: (event: Record<string, unknown>) => void;
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
};

function newReference(): string {
  return `BT-${randomBytes(5).toString('hex').toUpperCase()}`;
}

function clientIp(c: Context, trustProxy: boolean): string {
  if (trustProxy) {
    // The right-most X-Forwarded-For entry is the one appended by our own proxy.
    const forwarded = c.req
      .header('x-forwarded-for')
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const ip = forwarded?.at(-1);
    if (ip) return ip;
  }
  try {
    return getConnInfo(c).remote.address ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function json(c: Context, status: 200 | 400 | 403 | 415 | 429 | 500 | 503, body: EnquiryResponse) {
  c.header('Cache-Control', 'no-store');
  return c.json(body, status);
}

export function createApp(options: AppOptions) {
  const { config, mailer, staticRoot } = options;
  const now = options.now ?? Date.now;
  const log = options.log ?? ((event) => console.log(JSON.stringify(event)));
  const perIp = new RateLimiter(config.rateLimit.max, config.rateLimit.windowMs, now);
  const global = new RateLimiter(config.rateLimit.globalPerHour, 60 * 60_000, now);
  const completed = new IdempotencyCache(15 * 60_000, now);

  const app = new Hono();
  app.use('*', httpsRedirect(config));
  app.use('*', securityHeaders(config));
  app.use('*', compress());

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

      const ip = clientIp(c, config.trustProxy);
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

  if (staticRoot) {
    const root = path.resolve(staticRoot);

    const resolveInside = (relative: string): string | null => {
      const full = path.resolve(root, `.${relative}`);
      return full === root || full.startsWith(root + path.sep) ? full : null;
    };

    const fileResponse = async (c: Context, file: string, status: 200 | 404 = 200) => {
      const body = await readFile(file);
      const ext = path.extname(file).toLowerCase();
      c.header('Content-Type', MIME[ext] ?? 'application/octet-stream');
      if (ext === '.html') c.header('Cache-Control', 'no-cache');
      else if (file.includes(`${path.sep}assets${path.sep}`))
        c.header('Cache-Control', 'public, max-age=31536000, immutable');
      else c.header('Cache-Control', 'public, max-age=86400');
      return c.body(body, status);
    };

    const isFile = async (file: string) => {
      try {
        return (await stat(file)).isFile();
      } catch {
        return false;
      }
    };

    app.on(['GET', 'HEAD'], '*', async (c) => {
      let pathname: string;
      try {
        pathname = decodeURIComponent(new URL(c.req.url).pathname);
      } catch {
        return c.text('Bad request', 400);
      }
      if (pathname.includes('\0')) return c.text('Bad request', 400);

      // Canonical form: no trailing slash (except root), no index.html.
      if (pathname.length > 1 && pathname.endsWith('/')) {
        const search = new URL(c.req.url).search;
        return c.redirect(pathname.replace(/\/+$/, '') + search, 301);
      }

      const direct = resolveInside(pathname);
      if (
        direct &&
        path.extname(pathname) &&
        !pathname.endsWith('.html') &&
        (await isFile(direct))
      ) {
        return fileResponse(c, direct);
      }

      const page = resolveInside(path.posix.join(pathname, 'index.html'));
      if (page && !path.extname(pathname) && (await isFile(page))) return fileResponse(c, page);

      const notFound = resolveInside('/404.html');
      if (notFound && (await isFile(notFound))) return fileResponse(c, notFound, 404);
      return c.text('Not found', 404);
    });
  }

  app.onError((error, c) => {
    log({ event: 'unhandled_error', error: error.name });
    return c.text('Something went wrong.', 500);
  });

  return app;
}
