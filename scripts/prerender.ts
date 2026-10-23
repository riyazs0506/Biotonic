/**
 * Prerenders every public route to static HTML with complete <head> metadata, then writes
 * sitemap.xml and robots.txt. Run after `vite build` (client) and `vite build --ssr`.
 *
 * Output (dist/client):
 *   index.html, products/index.html, products/<slug>/index.html, …, 404.html,
 *   sitemap.xml, robots.txt
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { PageMeta } from '../src/lib/seo';

type ServerEntry = typeof import('../src/entry-server');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = path.join(root, 'dist/client');
const PLACEHOLDER = '[CLIENT TO CONFIRM]';

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** JSON safe to embed inside <script>: no "</script>" breakout, no HTML comment openers. */
const safeJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

function headTags(meta: PageMeta, fontPreloads: string[]): string {
  const tags = [
    `<title>${escapeAttr(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    `<meta name="robots" content="${escapeAttr(meta.robots)}" />`,
    `<link rel="canonical" href="${escapeAttr(meta.canonical)}" />`,
    `<meta property="og:site_name" content="Biotonic" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:type" content="${meta.ogType === 'product' ? 'product' : 'website'}" />`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(meta.canonical)}" />`,
    `<meta property="og:image" content="${escapeAttr(meta.image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Biotonic logo" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
    ...fontPreloads.map(
      (href) => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin />`,
    ),
    ...meta.jsonLd.map((data) => `<script type="application/ld+json">${safeJson(data)}</script>`),
  ];
  return tags.join('\n    ');
}

function outputFile(route: string): string {
  if (route === '/404') return path.join(clientDir, '404.html');
  if (route === '/') return path.join(clientDir, 'index.html');
  return path.join(clientDir, route.slice(1), 'index.html');
}

async function main() {
  const entry = (await import(
    pathToFileURL(path.join(root, 'dist/ssr/entry-server.js')).href
  )) as ServerEntry;
  const { render, getPageMeta, publicPaths, SITE_URL, CONTENT_MODE } = entry;
  const release = CONTENT_MODE === 'release';

  if (release && /localhost|127\.0\.0\.1/.test(SITE_URL)) {
    throw new Error('Release builds require VITE_SITE_URL to be set to the production origin.');
  }

  const template = await readFile(path.join(clientDir, 'index.html'), 'utf8');
  if (!template.includes('<!--app-head-->') || !template.includes('<!--app-html-->')) {
    throw new Error('dist/client/index.html is missing the prerender placeholders.');
  }

  const assets = await readdir(path.join(clientDir, 'assets'));
  const fontPreloads = [
    /^inter-latin-wght-normal-.*\.woff2$/,
    /^cormorant-garamond-latin-500-normal-.*\.woff2$/,
  ]
    .map((pattern) => assets.find((f) => pattern.test(f)))
    .filter((f): f is string => Boolean(f))
    .map((f) => `/assets/${f}`);

  const routes = [...publicPaths(), '/404'];
  const problems: string[] = [];

  for (const route of routes) {
    const meta = getPageMeta(route);
    if (route !== '/404' && !meta.found)
      problems.push(`${route}: listed as public but resolves to not-found`);
    const appHtml = await render(route);
    if (release && (appHtml.includes(PLACEHOLDER) || appHtml.includes('data-pending'))) {
      problems.push(`${route}: unresolved ${PLACEHOLDER} placeholder in release output`);
    }
    const html = template
      .replace('<!--app-head-->', headTags(meta, fontPreloads))
      .replace('<!--app-html-->', appHtml);
    const file = outputFile(route);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html);
  }

  if (problems.length) {
    throw new Error(`Prerender failed:\n  - ${problems.join('\n  - ')}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const sitemapPaths = publicPaths().filter((p) => getPageMeta(p).found);
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapPaths.map(
      (p) =>
        `  <url><loc>${escapeAttr(getPageMeta(p).canonical)}</loc><lastmod>${today}</lastmod></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');
  await writeFile(path.join(clientDir, 'sitemap.xml'), sitemap);

  const robots = release
    ? `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
    : `# Draft build — not for indexing.\nUser-agent: *\nDisallow: /\n`;
  await writeFile(path.join(clientDir, 'robots.txt'), robots);

  console.log(
    `Prerendered ${routes.length} pages (${CONTENT_MODE} mode, ${SITE_URL}); sitemap has ${sitemapPaths.length} URLs.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
