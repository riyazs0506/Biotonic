// @vitest-environment node
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app';
import { loadConfig, type ServerConfig } from './config';
import { createCaptureMailer, type Mailer } from './mailer';

const ORIGIN = 'https://www.biotonic.test';
const NOW = 1_800_000_000_000;

function setup(
  overrides: Partial<ServerConfig> = {},
  mailer: Mailer | null = createCaptureMailer(),
) {
  const base = loadConfig({
    NODE_ENV: 'test',
    SITE_URL: ORIGIN,
    MAIL_TRANSPORT: 'capture',
    TRUST_PROXY: 'true',
    ENQUIRY_TO: 'sales@biotonic.test',
  });
  const config = { ...base, ...overrides };
  const logs: Record<string, unknown>[] = [];
  const app = createApp({ config, mailer, now: () => NOW, log: (e) => logs.push(e) });
  return { app, config, logs, mailer };
}

const validBody = {
  kind: 'contact',
  name: 'Asha Rao',
  company: 'Acme Coatings',
  email: 'asha@acme.example',
  message: 'Please share availability for our plant.',
  consent: true,
  website: '',
  startedAt: NOW - 30_000,
};

function post(
  app: ReturnType<typeof setup>['app'],
  body: unknown,
  headers: Record<string, string> = {},
) {
  return app.request('/api/enquiry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: ORIGIN,
      'X-Forwarded-For': '203.0.113.7',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/enquiry', () => {
  it('delivers a valid enquiry and only then reports success', async () => {
    const { app, mailer } = setup();
    const res = await post(app, validBody);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; reference: string };
    expect(json.ok).toBe(true);
    expect(json.reference).toMatch(/^BT-[0-9A-F]{10}$/);
    const outbox = (mailer as ReturnType<typeof createCaptureMailer>).outbox;
    expect(outbox).toHaveLength(1);
    expect(outbox[0]?.to).toBe('sales@biotonic.test');
    expect(outbox[0]?.replyTo.address).toBe('asha@acme.example');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('never lets the request choose the recipient', async () => {
    const { app, mailer } = setup();
    await post(app, { ...validBody, to: 'attacker@evil.test', recipient: 'attacker@evil.test' });
    const outbox = (mailer as ReturnType<typeof createCaptureMailer>).outbox;
    expect(outbox[0]?.to).toBe('sales@biotonic.test');
  });

  it('prevents header injection through the subject line', async () => {
    const { app, mailer } = setup();
    await post(app, { ...validBody, company: 'Acme\r\nBcc: victim@evil.test' });
    const subject = (mailer as ReturnType<typeof createCaptureMailer>).outbox[0]?.subject ?? '';
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it('returns field errors for invalid input', async () => {
    const { app } = setup();
    const res = await post(app, { ...validBody, email: 'not-an-email', message: 'short' });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { code: string; fields: Record<string, string> };
    expect(json.code).toBe('validation');
    expect(Object.keys(json.fields).sort()).toEqual(['email', 'message']);
  });

  it('rejects malformed JSON without leaking details', async () => {
    const { app } = setup();
    const res = await post(app, '{not json');
    expect(res.status).toBe(400);
    expect(await res.text()).not.toMatch(/SyntaxError|at .*\.ts/);
  });

  it('rejects a filled honeypot and implausibly fast submissions', async () => {
    const { app, mailer } = setup();
    expect((await post(app, { ...validBody, website: 'http://spam.test' })).status).toBe(400);
    const fast = await post(app, { ...validBody, startedAt: NOW - 500 });
    expect(fast.status).toBe(400);
    expect(((await fast.json()) as { code: string }).code).toBe('rejected');
    expect((mailer as ReturnType<typeof createCaptureMailer>).outbox).toHaveLength(0);
  });

  it('rejects stale form tokens', async () => {
    const { app } = setup();
    const res = await post(app, { ...validBody, startedAt: NOW - 2 * 24 * 60 * 60 * 1000 });
    expect(res.status).toBe(400);
  });

  it('rejects cross-origin requests', async () => {
    const { app } = setup();
    expect((await post(app, validBody, { Origin: 'https://evil.test' })).status).toBe(403);
  });

  it('requires an Origin header in production', async () => {
    const { app } = setup({ env: 'production' });
    const res = await app.request('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(403);
  });

  it('requires a JSON content type', async () => {
    const { app } = setup();
    const res = await post(app, 'name=x', { 'Content-Type': 'application/x-www-form-urlencoded' });
    expect(res.status).toBe(415);
  });

  it('rejects oversized bodies', async () => {
    const { app } = setup();
    const res = await post(app, { ...validBody, message: 'x'.repeat(20_000) });
    expect(res.status).toBe(400);
  });

  it('rate-limits repeated submissions per client', async () => {
    const { app } = setup();
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await post(app, validBody)).status);
    expect(statuses.slice(0, 5).every((s) => s === 200)).toBe(true);
    expect(statuses[5]).toBe(429);
    const limited = await post(app, validBody);
    expect(limited.headers.get('Retry-After')).toMatch(/^\d+$/);
    // A different client is unaffected.
    expect((await post(app, validBody, { 'X-Forwarded-For': '198.51.100.9' })).status).toBe(200);
  });

  it('answers 503 and never claims success when email is not configured', async () => {
    const { app } = setup({ mail: { transport: 'disabled' } }, null);
    const res = await post(app, validBody);
    expect(res.status).toBe(503);
    expect(((await res.json()) as { ok: boolean; code: string }).code).toBe('unavailable');
  });

  it('answers 503 when the email provider fails, without logging personal data', async () => {
    const failing: Mailer = {
      name: 'failing',
      send: async () => {
        throw new Error('SMTP 421 asha@acme.example');
      },
    };
    const { app, logs } = setup({}, failing);
    const res = await post(app, validBody);
    expect(res.status).toBe(503);
    expect(((await res.json()) as { ok: boolean }).ok).toBe(false);
    expect(JSON.stringify(logs)).not.toMatch(/asha|Acme/i);
  });

  it('does not deliver the same submission twice for a repeated idempotency key', async () => {
    const { app, mailer } = setup();
    const key = '0b9f6a1e-2c3d-4e5f-8a7b-1c2d3e4f5a6b';
    const first = (await (await post(app, validBody, { 'Idempotency-Key': key })).json()) as {
      reference: string;
    };
    const second = (await (await post(app, validBody, { 'Idempotency-Key': key })).json()) as {
      reference: string;
    };
    expect(second.reference).toBe(first.reference);
    expect((mailer as ReturnType<typeof createCaptureMailer>).outbox).toHaveLength(1);
  });
});

describe('security headers and static serving', () => {
  let root: string;

  beforeAll(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'biotonic-static-'));
    await mkdir(path.join(root, 'about'), { recursive: true });
    await mkdir(path.join(root, 'assets'), { recursive: true });
    await writeFile(path.join(root, 'index.html'), '<h1>Home</h1>');
    await writeFile(path.join(root, 'about/index.html'), '<h1>About</h1>');
    await writeFile(path.join(root, '404.html'), '<h1>Not found</h1>');
    await writeFile(path.join(root, 'assets/app-abc.js'), 'console.log(1)');
    await writeFile(path.join(root, 'robots.txt'), 'User-agent: *');
  });

  const staticApp = () => {
    const config = loadConfig({
      NODE_ENV: 'test',
      SITE_URL: ORIGIN,
      FORCE_HTTPS: 'true',
      TRUST_PROXY: 'true',
    });
    return createApp({ config, mailer: null, staticRoot: root, log: () => {} });
  };
  const https = { 'X-Forwarded-Proto': 'https' };

  it('sets strict security headers on every response', async () => {
    const res = await staticApp().request('/', { headers: https });
    const csp = res.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).toContain("frame-ancestors 'none'");
    expect(res.headers.get('Strict-Transport-Security')).toMatch(/max-age=\d+/);
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('redirects HTTP to the configured HTTPS origin', async () => {
    const res = await staticApp().request('/about?x=1', {
      headers: { 'X-Forwarded-Proto': 'http', Host: 'evil.test' },
    });
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe(`${ORIGIN}/about?x=1`);
  });

  it('serves prerendered pages with 200 and unknown URLs with a real 404', async () => {
    const app = staticApp();
    const about = await app.request('/about', { headers: https });
    expect(about.status).toBe(200);
    expect(await about.text()).toContain('About');
    const missing = await app.request('/no-such-page', { headers: https });
    expect(missing.status).toBe(404);
    expect(await missing.text()).toContain('Not found');
  });

  it('redirects trailing slashes to the canonical URL', async () => {
    const res = await staticApp().request('/about/', { headers: https });
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe('/about');
  });

  it('caches hashed assets immutably and HTML not at all', async () => {
    const app = staticApp();
    const asset = await app.request('/assets/app-abc.js', { headers: https });
    expect(asset.headers.get('Cache-Control')).toContain('immutable');
    const page = await app.request('/', { headers: https });
    expect(page.headers.get('Cache-Control')).toBe('no-cache');
  });

  it('never serves platform files such as Cloudflare _headers', async () => {
    await writeFile(path.join(root, '_headers'), '/*\n  X-Test: 1');
    const res = await staticApp().request('/_headers', { headers: https });
    expect(res.status).toBe(404);
  });

  it('blocks path traversal', async () => {
    const res = await staticApp().request('/..%2f..%2fetc/passwd', { headers: https });
    expect(res.status).toBe(404);
  });

  it('returns JSON 404 for unknown API routes', async () => {
    const res = await staticApp().request('/api/unknown', { headers: https });
    expect(res.status).toBe(404);
  });
});

describe('configuration', () => {
  it('refuses the capture transport in production', () => {
    expect(() =>
      loadConfig({ NODE_ENV: 'production', SITE_URL: ORIGIN, MAIL_TRANSPORT: 'capture' }),
    ).toThrow(/development and tests only/);
  });

  it('requires SMTP settings when SMTP is selected, without echoing values', () => {
    expect(() =>
      loadConfig({ NODE_ENV: 'production', SITE_URL: ORIGIN, MAIL_TRANSPORT: 'smtp' }),
    ).toThrow(/SMTP_HOST, MAIL_FROM, ENQUIRY_TO/);
  });

  it('requires SITE_URL in production', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(/SITE_URL/);
  });
});
