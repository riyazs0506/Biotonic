/**
 * Site photography. Stock photos are from Unsplash (free to use under the Unsplash License),
 * resized to WebP under /public/images/stock. Source photo IDs are listed in docs/IMAGE-CREDITS.md.
 */
export const imagery = {
  about: {
    src: '/images/stock/about-refinery.webp',
    alt: 'Chemical processing plant with storage tanks and pipework at dusk',
  },
  leadership: {
    src: '/images/stock/leadership-godown.webp',
    alt: 'Forklift between tall racks of stock in a busy warehouse',
  },
  products: {
    src: '/images/stock/products-drums.webp',
    alt: 'Stacked blue industrial chemical drums',
  },
  product: {
    src: '/images/stock/product-sacks.webp',
    alt: 'Palletised bags of chemical product with blue labels',
  },
  industries: {
    src: '/images/stock/industries-textile-mill.webp',
    alt: 'Textile processing machinery inside a modern mill',
  },
  quality: {
    src: '/images/stock/quality-lab.webp',
    alt: 'Technicians working at testing equipment in a quality laboratory',
  },
  resources: {
    src: '/images/stock/resources-plant.webp',
    alt: 'Stainless steel process vessels and pipework at a chemical plant',
  },
  contact: {
    src: '/images/stock/contact-truck.webp',
    alt: 'Cargo truck on an Indian highway carrying a delivery',
  },
  quote: {
    src: '/images/stock/quote-barrels.webp',
    alt: 'Rows of orange and blue chemical barrels ready for dispatch',
  },
  quoteCta: {
    src: '/images/stock/cta-bulk-bags.webp',
    alt: '',
  },
  homeIntro: {
    src: '/images/stock/home-drums.webp',
    alt: 'Stacked red and cream chemical drums in a storage yard',
  },
} as const;

/** One photo per market, keyed by industry slug. */
export const marketImagery: Record<string, { src: string; alt: string }> = {
  textile: {
    src: '/images/stock/market-textile.webp',
    alt: 'Freshly dyed yarn in bright colours hanging to dry',
  },
  construction: {
    src: '/images/stock/market-construction.webp',
    alt: 'Concrete building under construction with a tower crane',
  },
  industrial: {
    src: '/images/stock/market-industrial.webp',
    alt: 'Industrial plant with red and white pipework',
  },
};

export const founderHeadshot = {
  src: '/image/founder/biotonic-founder-head.webp',
  alt: 'Keerthi Vasan, founder of Biotonic',
};
