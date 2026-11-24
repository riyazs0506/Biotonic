/**
 * Renders the 3D hero scene once and saves it as the static poster that is shown before the
 * live model loads (and to visitors without WebGL or with reduced motion).
 *
 * Usage: npm run build && npm run start:local   (in another terminal)
 *        npx tsx scripts/generate-hero-poster.ts [http://localhost:8787]
 * Re-run whenever the 3D scene or the logo changes.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] ?? 'http://localhost:8787';
const out = path.join(root, 'public/images/hero/products-poster.webp');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/#capture-poster`);
  await page.waitForSelector('[data-scene-ready="true"] canvas', { timeout: 120_000 });
  await page.waitForTimeout(800);
  const dataUrl = await page.$eval('[data-scene-ready="true"] canvas', (canvas) =>
    (canvas as HTMLCanvasElement).toDataURL('image/webp', 0.86),
  );
  if (!dataUrl.startsWith('data:image/webp')) throw new Error('Browser did not encode WebP');
  const bytes = Buffer.from(dataUrl.split(',')[1] ?? '', 'base64');
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, bytes);
  const size = await page.$eval('[data-scene-ready="true"] canvas', (c) => [
    (c as HTMLCanvasElement).width,
    (c as HTMLCanvasElement).height,
  ]);
  console.log(
    `Wrote ${path.relative(root, out)} (${size.join('×')}, ${Math.round(bytes.length / 1024)} KB)`,
  );
  await browser.close();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
