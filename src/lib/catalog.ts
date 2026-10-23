import rawCategories from '../content/catalogue/categories.json';
import rawProducts from '../content/catalogue/products.json';
import type { Category, Product } from '../content/catalogue/schema';
import { demo } from '../content/demo';
import { IS_RELEASE } from './env';

export type { Category, Product };

export interface Catalogue {
  categories: Category[];
  products: Product[];
}

/** Release builds never publish development samples. */
export function publishable(catalogue: Catalogue, release: boolean): Catalogue {
  if (!release) return catalogue;
  const products = catalogue.products.filter((p) => !p.sample);
  const used = new Set(products.map((p) => p.category));
  const categories = catalogue.categories.filter((c) => !c.sample && used.has(c.slug));
  return { categories, products };
}

// The JSON files are validated against the schema at build time (`npm run content:check`,
// run by the release build) and in unit tests, so the browser bundle does not ship a validator.
export const catalogue: Catalogue = publishable(
  {
    categories: [...(rawCategories as Category[]), ...(demo.catalogue.categories ?? [])],
    products: [...(rawProducts as Product[]), ...(demo.catalogue.products ?? [])],
  },
  IS_RELEASE,
);

export function getProduct(slug: string, source: Catalogue = catalogue): Product | undefined {
  return source.products.find((p) => p.slug === slug);
}

export function getCategory(slug: string, source: Catalogue = catalogue): Category | undefined {
  return source.categories.find((c) => c.slug === slug);
}

export function featuredProducts(source: Catalogue = catalogue): Product[] {
  return source.products.filter((p) => p.featured).slice(0, 3);
}

export function relatedProducts(product: Product, source: Catalogue = catalogue): Product[] {
  return source.products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);
}

function normalise(value: string): string {
  return value.toLocaleLowerCase('en').normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();
}

export interface ProductQuery {
  search?: string;
  category?: string;
}

/** Case- and accent-insensitive search across name, summary, applications and specifications. */
export function filterProducts(products: Product[], query: ProductQuery): Product[] {
  const terms = normalise(query.search ?? '')
    .split(/\s+/)
    .filter(Boolean);
  return products.filter((product) => {
    if (query.category && product.category !== query.category) return false;
    if (terms.length === 0) return true;
    const haystack = normalise(
      [
        product.name,
        product.summary,
        ...product.applications,
        ...product.specifications.map((s) => `${s.label} ${s.value}`),
      ].join(' '),
    );
    // Single characters (e.g. the "A" in "Grade A") would match almost any text, so they only
    // match a whole word of the product name.
    const nameWords = new Set(normalise(product.name).split(/[^a-z0-9]+/));
    return terms.every((term) => (term.length > 1 ? haystack.includes(term) : nameWords.has(term)));
  });
}

export function categoryCounts(source: Catalogue = catalogue): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of source.products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return counts;
}
