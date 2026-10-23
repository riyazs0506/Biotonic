import { describe, expect, it } from 'vitest';
import rawCategories from '../content/catalogue/categories.json';
import rawProducts from '../content/catalogue/products.json';
import { parseCatalogue, type Product } from '../content/catalogue/schema';
import { demo } from '../content/demo';
import { filterProducts, publishable } from './catalog';

const product = (overrides: Partial<Product>): Product => ({
  slug: 'prod',
  name: 'Product',
  category: 'cat-a',
  summary: 'A useful summary.',
  description: ['A longer description.'],
  applications: [],
  specifications: [],
  packaging: [],
  documents: [],
  ...overrides,
});

describe('catalogue data', () => {
  it('the shipped catalogue JSON and the demo catalogue are valid', () => {
    expect(() => parseCatalogue(rawCategories, rawProducts)).not.toThrow();
    expect(() =>
      parseCatalogue(
        [...rawCategories, ...demo.catalogue.categories],
        [...rawProducts, ...demo.catalogue.products],
      ),
    ).not.toThrow();
  });

  it('rejects a product that references an unknown category', () => {
    const categories = [
      { slug: 'cat-a', name: 'Category A', description: 'A category description' },
    ];
    expect(() => parseCatalogue(categories, [product({ category: 'missing' })])).toThrow(
      /unknown category/,
    );
  });

  it('rejects duplicate slugs and malformed slugs', () => {
    const categories = [
      { slug: 'cat-a', name: 'Category A', description: 'A category description' },
    ];
    expect(() => parseCatalogue(categories, [product({}), product({})])).toThrow(/Duplicate/);
    expect(() => parseCatalogue(categories, [product({ slug: 'Bad Slug' })])).toThrow();
  });

  it('release builds remove sample products and their categories', () => {
    const catalogue = {
      categories: [
        { slug: 'cat-a', name: 'A', description: 'Real category', sample: false },
        { slug: 'cat-s', name: 'S', description: 'Sample category', sample: true },
      ],
      products: [
        product({ slug: 'real' }),
        product({ slug: 'demo', category: 'cat-s', sample: true }),
      ],
    };
    const released = publishable(catalogue, true);
    expect(released.products.map((p) => p.slug)).toEqual(['real']);
    expect(released.categories.map((c) => c.slug)).toEqual(['cat-a']);
    expect(publishable(catalogue, false)).toBe(catalogue);
  });
});

describe('filterProducts', () => {
  const products = [
    product({ slug: 'a', name: 'Sodium Hydroxide', applications: ['Water treatment'] }),
    product({
      slug: 'b',
      name: 'Citric Acid',
      category: 'cat-b',
      specifications: [{ label: 'Grade', value: 'Food' }],
    }),
  ];

  it('matches case- and accent-insensitively across name, uses and specs', () => {
    expect(filterProducts(products, { search: 'SODIUM' }).map((p) => p.slug)).toEqual(['a']);
    expect(filterProducts(products, { search: 'water' }).map((p) => p.slug)).toEqual(['a']);
    expect(filterProducts(products, { search: 'fóod' }).map((p) => p.slug)).toEqual(['b']);
  });

  it('requires every search term to match', () => {
    expect(filterProducts(products, { search: 'citric water' })).toHaveLength(0);
  });

  it('filters by category and combines with search', () => {
    expect(filterProducts(products, { category: 'cat-b' }).map((p) => p.slug)).toEqual(['b']);
    expect(filterProducts(products, { category: 'cat-b', search: 'sodium' })).toHaveLength(0);
  });

  it('matches single-character terms as whole words only', () => {
    const lettered = [
      product({ slug: 'x-a', name: 'Grade A Solvent' }),
      product({ slug: 'x-b', name: 'Grade B Solvent' }),
    ];
    expect(filterProducts(lettered, { search: 'grade a' }).map((p) => p.slug)).toEqual(['x-a']);
  });

  it('returns everything for an empty query', () => {
    expect(filterProducts(products, { search: '   ' })).toHaveLength(2);
  });
});
