/**
 * Internal link and asset validation over the prerendered output (dist/client).
 * Every same-origin href/src must resolve to a prerendered page or a built file.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/client');

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return e.name === 'assets' ? [] : htmlFiles(full);
      return e.name.endsWith('.html') ? [full] : [];
    }),
  );
  return nested.flat();
}

async function exists(file: string) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function resolves(url: string): Promise<boolean> {
  const pathname = decodeURIComponent(url.split(/[?#]/)[0] ?? '/');
  if (path.extname(pathname)) return exists(path.join(root, pathname));
  if (pathname === '/') return exists(path.join(root, 'index.html'));
  return exists(path.join(root, pathname, 'index.html'));
}

async function main() {
  const files = await htmlFiles(root);
  const broken: string[] = [];
  let checked = 0;
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const urls = [...html.matchAll(/\s(?:href|src|srcSet|srcset)="(\/[^"]*)"/g)]
      .map((m) => m[1])
      .filter((u): u is string => Boolean(u));
    for (const url of new Set(urls)) {
      checked++;
      if (!(await resolves(url))) broken.push(`${path.relative(root, file)} → ${url}`);
    }
  }
  if (broken.length) {
    console.error(`✗ ${broken.length} broken internal link(s):\n  ${broken.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`✓ ${checked} internal links/assets across ${files.length} pages resolve.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
