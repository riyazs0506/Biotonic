import type { Stat } from './company';

/**
 * Markets Biotonic serves. Source: "Biotonic — Strategy Framework" (Visionary X, November 2026):
 * three markets — textile, construction and industrial chemicals.
 */
export interface Industry {
  slug: string;
  name: string;
  /** Who buys, in the strategy's words. */
  buyers: string;
  summary: string;
  /** Product slugs relevant to this market (missing products are skipped). */
  productSlugs: string[];
}

export const industries: Industry[] = [
  {
    slug: 'textile',
    name: 'Textile processing',
    buyers: 'Dyeing, printing and processing units · garment exporters',
    summary:
      'Tiruppur’s knitwear cluster runs on chemistry. With ZDHC and zero-liquid-discharge requirements rising, processors need the right chemical used the right way — advice, not just supply.',
    productSlugs: ['pigment-printing-emulsion', 'textile-softener'],
  },
  {
    slug: 'construction',
    name: 'Construction',
    buyers: 'Contractors · applicators · builders',
    summary:
      'Construction chemicals from leading principal brands, with application know-how and site support so every job is done right first time.',
    productSlugs: ['waterproofing-coating', 'tile-adhesive'],
  },
  {
    slug: 'industrial',
    name: 'Industrial chemicals',
    buyers: 'Manufacturers using glycols and performance chemicals',
    summary:
      'Glycols and performance chemicals as genuine, traceable principal products, from stock you can plan production around.',
    productSlugs: ['monoethylene-glycol', 'diethylene-glycol'],
  },
];

/** "The market Biotonic serves" — third-party figures, published with their sources. */
export const marketContext = {
  stats: [
    { value: '₹42,544 Cr', label: 'Tiruppur garment exports in FY 2025–26' },
    { value: '55–60%', label: 'Tiruppur’s share of India’s knitwear exports' },
    {
      value: 'US$13.6B',
      label: 'India chemical distribution market (2024), forecast US$26B by 2035',
    },
    { value: '₹1 lakh Cr', label: 'Tiruppur’s export target for 2030' },
  ] satisfies Stat[],
  insight:
    'Every garment, building and factory in the region runs on chemistry. Growth plus compliance pressure (ZDHC, zero liquid discharge) means buyers need advice, not just supply.',
  sources:
    'Sources: Tiruppur Exporters’ Association via Apparel Resources (2026); Deccan Herald; Market Research Future.',
};

/** Where Biotonic operates (strategy: geography). */
export const geography = {
  current: 'Tiruppur, Erode and Coimbatore belt',
  /** Written to read mid-sentence: "expanding across …". */
  next: 'wider Tamil Nadu and South India',
};
