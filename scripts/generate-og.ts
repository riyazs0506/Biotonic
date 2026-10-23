/**
 * Generates public/og-image.png (1200×630) from the official logo artwork.
 * Run manually when the brand assets change: `npx tsx scripts/generate-og.ts`.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const logo = (await readFile(path.join(root, 'public/brand/logo-spaced.png'))).toString('base64');
  const html = `<!doctype html><html><head><style>
    body{margin:0;width:1200px;height:630px;display:grid;place-items:center;background:
      radial-gradient(60% 70% at 80% 40%, rgba(33,191,117,.16), transparent 70%), #FBFAF7;
      font-family: Georgia, serif;}
    .wrap{display:grid;gap:44px;justify-items:center}
    img{width:760px}
    p{margin:0;color:#0E1016;font-size:40px;font-style:italic;letter-spacing:.01em}
    .rule{width:120px;height:2px;background:#109255}
  </style></head><body><div class="wrap">
    <img src="data:image/png;base64,${logo}" alt="">
    <div class="rule"></div>
    <p>Chemistry you can trust, at first glance.</p>
  </div></body></html>`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  await page.screenshot({ path: path.join(root, 'public/og-image.png') });
  await browser.close();
  console.log('Wrote public/og-image.png');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
