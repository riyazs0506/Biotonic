import { describe, expect, it } from 'vitest';
import { catalogue } from './catalog';
import { publicPaths } from './routes';
import { getPageMeta, normalisePath } from './seo';

describe('route metadata', () => {
  const pages = publicPaths().map((p) => getPageMeta(p));

  it('every public page resolves and has an absolute canonical URL', () => {
    for (const meta of pages) {
      expect(meta.found, meta.path).toBe(true);
      expect(meta.canonical).toMatch(/^https?:\/\/[^/]+\//);
    }
  });

  it('titles and descriptions are unique', () => {
    const titles = new Set(pages.map((m) => m.title));
    const descriptions = new Set(
      pages.filter((m) => !m.path.startsWith('/products/')).map((m) => m.description),
    );
    expect(titles.size).toBe(pages.length);
    expect(descriptions.size).toBe(pages.filter((m) => !m.path.startsWith('/products/')).length);
  });

  it('titles and descriptions stay within search-result lengths', () => {
    for (const meta of pages) {
      expect(meta.title.length, meta.title).toBeLessThanOrEqual(65);
      expect(meta.description.length, meta.path).toBeLessThanOrEqual(170);
    }
  });

  it('draft builds are not indexable', () => {
    expect(getPageMeta('/').robots).toBe('noindex, nofollow');
  });

  it('home has Organization and WebSite structured data; inner pages have breadcrumbs', () => {
    const types = getPageMeta('/').jsonLd.map((d) => d['@type']);
    expect(types).toEqual(['Organization', 'WebSite']);
    expect(getPageMeta('/about').jsonLd[0]?.['@type']).toBe('BreadcrumbList');
  });

  it('never emits Product structured data for sample products', () => {
    for (const product of catalogue.products.filter((p) => p.sample)) {
      const types = getPageMeta(`/products/${product.slug}`).jsonLd.map((d) => d['@type']);
      expect(types).not.toContain('Product');
    }
  });

  it('structured data contains no unverified commercial claims', () => {
    const json = JSON.stringify(pages.flatMap((m) => m.jsonLd));
    expect(json).not.toMatch(/aggregateRating|review|offers|price/i);
  });

  it('unknown routes are reported as not found and noindex', () => {
    const meta = getPageMeta('/does-not-exist');
    expect(meta.found).toBe(false);
    expect(meta.robots).toMatch(/noindex/);
    expect(getPageMeta('/products/not-a-product').found).toBe(false);
  });

  it('normalises trailing slashes and query strings', () => {
    expect(normalisePath('/about/')).toBe('/about');
    expect(normalisePath('/products?q=x')).toBe('/products');
    expect(normalisePath('/')).toBe('/');
  });
});
