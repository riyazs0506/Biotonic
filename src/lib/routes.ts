import { catalogue } from './catalog';
import { isPublished, type OptionalPage } from './publication';

/** Central list of public paths. Used by navigation, prerendering, sitemap and link checks. */
export const paths = {
  home: '/',
  products: '/products',
  product: (slug: string) => `/products/${slug}`,
  about: '/about',
  leadership: '/leadership',
  quality: '/quality',
  industries: '/industries',
  resources: '/resources',
  contact: '/contact',
  quote: '/request-a-quote',
  privacy: '/privacy-policy',
  terms: '/terms',
} as const;

export interface NavItem {
  label: string;
  to: string;
  page?: OptionalPage;
}

export const primaryNav: NavItem[] = [
  { label: 'Products', to: paths.products },
  { label: 'Industries', to: paths.industries, page: 'industries' },
  { label: 'Quality', to: paths.quality, page: 'quality' },
  { label: 'About', to: paths.about },
  { label: 'Contact', to: paths.contact },
];

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Company',
    items: [
      { label: 'About Biotonic', to: paths.about },
      { label: 'Leadership', to: paths.leadership, page: 'leadership' },
      { label: 'Quality', to: paths.quality, page: 'quality' },
      { label: 'Industries', to: paths.industries, page: 'industries' },
    ],
  },
  {
    heading: 'Products',
    items: [
      { label: 'Product catalogue', to: paths.products },
      { label: 'Technical resources', to: paths.resources, page: 'resources' },
      { label: 'Request a quote', to: paths.quote },
    ],
  },
  {
    heading: 'Support',
    items: [
      { label: 'Contact', to: paths.contact },
      { label: 'Privacy Policy', to: paths.privacy },
      { label: 'Terms of Use', to: paths.terms },
    ],
  },
];

export function visible(items: NavItem[]): NavItem[] {
  return items.filter((item) => !item.page || isPublished(item.page));
}

/** Every path that should exist as a prerendered, indexable page. */
export function publicPaths(): string[] {
  const optional: [OptionalPage, string][] = [
    ['leadership', paths.leadership],
    ['quality', paths.quality],
    ['industries', paths.industries],
    ['resources', paths.resources],
  ];
  return [
    paths.home,
    paths.products,
    ...catalogue.products.map((p) => paths.product(p.slug)),
    paths.about,
    ...optional.filter(([page]) => isPublished(page)).map(([, path]) => path),
    paths.contact,
    paths.quote,
    paths.privacy,
    paths.terms,
  ];
}
