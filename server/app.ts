import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { getConnInfo } from '@hono/node-server/conninfo';
import type { Context } from 'hono';
import { createApiApp, type ApiOptions } from './api';

/**
 * Node server: the enquiry API plus the prerendered site from disk, with real 404s.
 * (On Cloudflare Workers static files are served by Workers Static Assets instead.)
 */
export interface AppOptions extends Omit<ApiOptions, 'remoteAddress'> {
  /** Directory containing the prerendered site (dist/client). Omit for API-only mode. */
  staticRoot?: string;
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

export function createApp(options: AppOptions) {
  const { staticRoot } = options;
  const app = createApiApp({
    ...options,
    remoteAddress: (c) => {
      try {
        return getConnInfo(c).remote.address;
      } catch {
        return undefined;
      }
    },
  });

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
      if (/\/[._]/.test(pathname)) return c.text('Not found', 404);

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

  return app;
}
