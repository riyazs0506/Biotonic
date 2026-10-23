import { createApiApp } from '../server/api';
import { loadConfig } from '../server/config';
import { createResendMailer, type Mailer } from '../server/mailer';

/**
 * Cloudflare Workers entry.
 *
 * Static pages, assets, `_headers` and the 404 page are served by Workers Static Assets
 * (see wrangler.jsonc). Only `/api/*` reaches this code, which runs the same enquiry API
 * as the Node server. Email goes through Resend's HTTP API (SMTP is unavailable on Workers).
 */
interface Env {
  ASSETS: Fetcher;
  [key: string]: unknown;
}

type ApiApp = ReturnType<typeof createApiApp>;
let app: ApiApp | undefined;

function build(env: Env, requestOrigin: string): ApiApp {
  const vars: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') vars[key] = value;
  }
  // Behind Cloudflare: HTTPS is enforced at the edge and CF-Connecting-IP is trustworthy.
  const config = loadConfig({
    NODE_ENV: 'production',
    SITE_URL: requestOrigin,
    ...vars,
    TRUST_PROXY: 'true',
    FORCE_HTTPS: 'false',
  });
  if (config.mail.transport === 'smtp' || config.mail.transport === 'capture') {
    throw new Error(`MAIL_TRANSPORT=${config.mail.transport} is not supported on Workers`);
  }
  const mailer: Mailer | null =
    config.mail.transport === 'resend' ? createResendMailer(config.mail) : null;
  return createApiApp({ config, mailer, compress: false });
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    app ??= build(env, url.origin);
    return app.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
