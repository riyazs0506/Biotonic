/**
 * Content validation.
 *
 * Always:  validates the product catalogue against its schema and cross-references.
 * Always:  prints every `[CLIENT TO CONFIRM]` item still pending.
 * Release: (VITE_CONTENT_MODE=release) fails if any launch-blocking item is unresolved.
 *
 * Usage: npm run content:check            (draft report)
 *        VITE_CONTENT_MODE=release npm run content:check
 */
import rawCategories from '../src/content/catalogue/categories.json';
import rawProducts from '../src/content/catalogue/products.json';
import { parseCatalogue } from '../src/content/catalogue/schema';
import { company } from '../src/content/company';
import { demo } from '../src/content/demo';
import { industries } from '../src/content/industries';
import { founder } from '../src/content/leadership';
import { privacyPolicy, terms } from '../src/content/legal';
import { collectPending, isPending } from '../src/content/pending';
import { quality } from '../src/content/quality';
import { site } from '../src/content/site';

export interface ContentReport {
  errors: string[];
  blocking: string[];
  pending: { path: string; note: string }[];
}

export function checkContent(release: boolean, siteUrl: string | undefined): ContentReport {
  const errors: string[] = [];
  const blocking: string[] = [];

  try {
    // Real catalogue on its own, then real + demo together (as draft builds render it).
    const parsed = parseCatalogue(rawCategories, rawProducts);
    parseCatalogue(
      [...rawCategories, ...demo.catalogue.categories],
      [...rawProducts, ...demo.catalogue.products],
    );
    if (release) {
      const real = parsed.products.filter((p) => !p.sample);
      if (real.length === 0) {
        // Not blocking: the catalogue page has a designed empty state. Reported for visibility.
        console.warn(
          '! No confirmed products — the catalogue will show its "being prepared" state.',
        );
      }
      for (const p of real) {
        const category = parsed.categories.find((c) => c.slug === p.category);
        if (category?.sample)
          errors.push(`Product "${p.slug}" uses sample category "${p.category}"`);
      }
    }
  } catch (error) {
    errors.push(`Catalogue: ${(error as Error).message}`);
  }

  const pending = collectPending({
    site,
    company,
    founder,
    industries,
    quality,
    privacyPolicy,
    terms,
  });

  // Facts without which the site must not launch publicly.
  if (release) {
    if (!siteUrl || /localhost|127\.0\.0\.1/.test(siteUrl)) {
      blocking.push(
        'VITE_SITE_URL must be set to the production origin (e.g. https://www.example.com)',
      );
    }
    if (isPending(site.legalName)) blocking.push(`site.legalName — ${site.legalName.note}`);
    if (isPending(site.email)) blocking.push(`site.email — ${site.email.note}`);
    if (!privacyPolicy.approved) blocking.push('privacyPolicy.approved — legal sign-off required');
    if (!terms.approved) blocking.push('terms.approved — legal sign-off required');
    for (const item of collectPending({ privacyPolicy, terms })) {
      blocking.push(`${item.path} — ${item.note}`);
    }
  }

  return { errors, blocking, pending };
}

const isMain = process.argv[1]?.endsWith('validate-content.ts');
if (isMain) {
  const release = process.env.VITE_CONTENT_MODE === 'release';
  const report = checkContent(release, process.env.VITE_SITE_URL);

  console.log(`Content check (${release ? 'release' : 'draft'} mode)`);
  if (report.pending.length) {
    console.log(`\n${report.pending.length} item(s) awaiting client confirmation:`);
    for (const item of report.pending) console.log(`  · ${item.path}: ${item.note}`);
    if (release) {
      console.log('  (Non-blocking items are hidden from the public site until confirmed.)');
    }
  }
  if (report.errors.length) {
    console.error(`\n✗ ${report.errors.length} content error(s):`);
    for (const e of report.errors) console.error(`  - ${e}`);
  }
  if (report.blocking.length) {
    console.error(`\n✗ ${report.blocking.length} launch-blocking item(s) unresolved:`);
    for (const b of report.blocking) console.error(`  - ${b}`);
  }
  if (report.errors.length || report.blocking.length) process.exit(1);
  console.log('\n✓ Content check passed.');
}
