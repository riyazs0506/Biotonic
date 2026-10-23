/**
 * Lightweight secret scan of project source (no dependencies). Complements — does not
 * replace — a dedicated scanner such as gitleaks in CI (see docs/SECURITY.md).
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  'playwright-report',
  'test-results',
  'brand-source',
]);
const SKIP_EXT = new Set(['.png', '.webp', '.jpg', '.woff', '.woff2', '.pdf', '.ico', '.zip']);

const rules = [
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ['Stripe live key', /\b[sr]k_live_[A-Za-z0-9]{20,}/],
  ['SendGrid key', /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Assigned secret', /\b(?:SMTP_PASS|PASSWORD|SECRET|API_KEY|TOKEN)\s*=\s*['"]?[^\s'"#]{8,}/],
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(path.join(dir, entry.name));
    } else if (!SKIP_EXT.has(path.extname(entry.name).toLowerCase())) {
      yield path.join(dir, entry.name);
    }
  }
}

const findings = [];
let scanned = 0;
for await (const file of walk(root)) {
  const rel = path.relative(root, file);
  if (rel === 'package-lock.json') continue;
  if (/^\.env(\..+)?$/.test(path.basename(file)) && path.basename(file) !== '.env.example') {
    findings.push(`${rel}: environment file present in the project tree (must never be committed)`);
  }
  const text = await readFile(file, 'utf8');
  scanned++;
  text.split('\n').forEach((line, i) => {
    for (const [name, pattern] of rules) {
      if (pattern.test(line) && !line.includes('scan-secrets: allow')) {
        findings.push(`${rel}:${i + 1}: possible ${name}`);
      }
    }
  });
}

if (findings.length) {
  console.error(`✗ Possible secrets found:\n  ${findings.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ No secrets detected in ${scanned} files.`);
