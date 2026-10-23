import { z } from 'zod';

/**
 * Catalogue schema. Product data lives in `categories.json` and `products.json` so the
 * catalogue can be updated without touching page components. Every entry is validated
 * at build time (`npm run content:check`) and when the site loads.
 *
 * `sample: true` marks a development placeholder. Samples are visible in draft builds
 * (with a "Sample" badge) and are removed from release builds.
 */
const slug = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens');

export const categorySchema = z.object({
  slug,
  name: z.string().min(2).max(60),
  description: z.string().min(10).max(240),
  sample: z.boolean().optional(),
});

export const productSchema = z.object({
  slug,
  name: z.string().min(2).max(90),
  category: slug,
  summary: z.string().min(10).max(220),
  description: z.array(z.string().min(10).max(1200)).min(1),
  applications: z.array(z.string().min(2).max(120)),
  specifications: z.array(
    z.object({ label: z.string().min(1).max(60), value: z.string().min(1).max(120) }),
  ),
  packaging: z.array(z.string().min(2).max(80)),
  documents: z.array(
    z.object({
      label: z.string().min(2).max(80),
      href: z.string().regex(/^(\/|https:\/\/)/, 'Use a site path or https URL'),
    }),
  ),
  featured: z.boolean().optional(),
  sample: z.boolean().optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type Product = z.output<typeof productSchema>;

export interface ParsedCatalogue {
  categories: Category[];
  products: Product[];
}

/** Validates raw catalogue data and checks cross-references. Throws with a readable message. */
export function parseCatalogue(categoriesInput: unknown, productsInput: unknown): ParsedCatalogue {
  const categories = z.array(categorySchema).parse(categoriesInput);
  const products = z.array(productSchema).parse(productsInput);

  const categorySlugs = new Set(categories.map((c) => c.slug));
  const seen = new Set<string>();
  for (const product of products) {
    if (!categorySlugs.has(product.category)) {
      throw new Error(
        `Product "${product.slug}" references unknown category "${product.category}"`,
      );
    }
    if (seen.has(product.slug)) throw new Error(`Duplicate product slug "${product.slug}"`);
    seen.add(product.slug);
  }
  return { categories, products };
}
