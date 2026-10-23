/**
 * Build-time public configuration. Nothing here is secret: every value is embedded in
 * the browser bundle. Private settings (SMTP credentials, enquiry recipient) live only
 * in the server environment — see `server/config.ts`.
 */
type PublicEnv = Partial<Record<'VITE_CONTENT_MODE' | 'VITE_SITE_URL', string>>;

// Vite statically replaces `import.meta.env`; build scripts run under Node read `process.env`.
const viteEnv = import.meta.env as PublicEnv | undefined;
const nodeEnv = (globalThis as { process?: { env: PublicEnv } }).process?.env;

function read(key: keyof PublicEnv): string | undefined {
  return viteEnv?.[key] || nodeEnv?.[key] || undefined;
}

export type ContentMode = 'draft' | 'release';

/**
 * `draft`   — placeholders are visible and every page is marked noindex (safe for staging).
 * `release` — placeholders are hidden, incomplete sections are unpublished, pages are indexable.
 */
export const CONTENT_MODE: ContentMode =
  read('VITE_CONTENT_MODE') === 'release' ? 'release' : 'draft';

export const IS_RELEASE = CONTENT_MODE === 'release';

/** Absolute origin used for canonical URLs, sitemap and structured data. No trailing slash. */
export const SITE_URL = (read('VITE_SITE_URL') ?? 'http://localhost:8787').replace(/\/+$/, '');
