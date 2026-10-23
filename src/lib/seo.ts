import { isConfirmed } from '../content/pending';
import { site } from '../content/site';
import { getCategory, getProduct } from './catalog';
import { IS_RELEASE, SITE_URL } from './env';
import { isPublished } from './publication';
import { paths } from './routes';

/**
 * Route-level metadata — the single source used by prerendering (static HTML <head>)
 * and by the client when navigating between pages.
 */
export interface Crumb {
  label: string;
  path: string;
}

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  canonical: string;
  robots: string;
  ogType: 'website' | 'product';
  image: string;
  breadcrumbs: Crumb[];
  jsonLd: Record<string, unknown>[];
  /** False for pages that should answer with HTTP 404. */
  found: boolean;
}

const BRAND = site.brandName;
const OG_IMAGE = '/og-image.png';

interface StaticEntry {
  title: string;
  description: string;
  label: string;
}

const staticPages: Record<string, StaticEntry> = {
  [paths.home]: {
    title: `${BRAND} — Chemistry You Can Trust | B2B Chemical Products`,
    description:
      'Biotonic supplies chemical products to businesses. Explore the product catalogue and request a quotation for your requirements.',
    label: 'Home',
  },
  [paths.products]: {
    title: `Chemical Product Catalogue | ${BRAND}`,
    description:
      'Browse Biotonic’s chemical products by category, view specifications and request a quotation for your business.',
    label: 'Products',
  },
  [paths.about]: {
    title: `About ${BRAND} | B2B Chemical Supplier`,
    description:
      'Learn about Biotonic, a supplier of chemical products to businesses, and the principles behind how we work.',
    label: 'About',
  },
  [paths.leadership]: {
    title: `Leadership | ${BRAND}`,
    description: 'Meet the founder and leadership behind Biotonic.',
    label: 'Leadership',
  },
  [paths.quality]: {
    title: `Quality & Applications | ${BRAND}`,
    description:
      'How Biotonic approaches quality, documentation and the applications of its chemical products.',
    label: 'Quality',
  },
  [paths.industries]: {
    title: `Industries & Solutions | ${BRAND}`,
    description: 'The industries Biotonic supplies and the chemical products relevant to each.',
    label: 'Industries',
  },
  [paths.resources]: {
    title: `Technical Resources | ${BRAND}`,
    description: 'Download technical documents and product information from Biotonic.',
    label: 'Resources',
  },
  [paths.contact]: {
    title: `Contact ${BRAND}`,
    description:
      'Contact Biotonic about chemical products, availability and supply. Send an enquiry and our team will respond.',
    label: 'Contact',
  },
  [paths.quote]: {
    title: `Request a Quote | ${BRAND}`,
    description:
      'Request a quotation from Biotonic. Share the product, quantity and delivery details your business needs.',
    label: 'Request a quote',
  },
  [paths.privacy]: {
    title: `Privacy Policy | ${BRAND}`,
    description:
      'How Biotonic collects, uses and protects information submitted through this website.',
    label: 'Privacy Policy',
  },
  [paths.terms]: {
    title: `Terms of Use | ${BRAND}`,
    description: 'The terms that apply to your use of the Biotonic website.',
    label: 'Terms of Use',
  },
};

const optionalByPath: Record<string, Parameters<typeof isPublished>[0]> = {
  [paths.leadership]: 'leadership',
  [paths.quality]: 'quality',
  [paths.industries]: 'industries',
  [paths.resources]: 'resources',
};

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path === '/' ? '/' : path}`;
}

export function normalisePath(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0] ?? '/';
  return clean.length > 1 ? clean.replace(/\/+$/, '') : '/';
}

function organizationLd(): Record<string, unknown> {
  const org: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/brand/logo-continuous.png'),
    slogan: site.tagline,
    description: site.summary,
  };
  if (isConfirmed(site.legalName)) org.legalName = site.legalName;
  if (isConfirmed(site.email)) org.email = site.email;
  if (isConfirmed(site.phone)) org.telephone = site.phone;
  if (isConfirmed(site.social) && site.social.length) org.sameAs = site.social.map((s) => s.href);
  return org;
}

function websiteLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: BRAND,
    url: absoluteUrl('/'),
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

function breadcrumbLd(crumbs: Crumb[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: absoluteUrl(c.path),
    })),
  };
}

function notFound(path: string): PageMeta {
  return {
    title: `Page not found | ${BRAND}`,
    description: 'The page you were looking for could not be found.',
    path,
    canonical: absoluteUrl(path),
    robots: 'noindex, follow',
    ogType: 'website',
    image: absoluteUrl(OG_IMAGE),
    breadcrumbs: [],
    jsonLd: [],
    found: false,
  };
}

export function getPageMeta(pathname: string): PageMeta {
  const path = normalisePath(pathname);
  const robots = IS_RELEASE ? 'index, follow, max-image-preview:large' : 'noindex, nofollow';
  const home: Crumb = { label: 'Home', path: paths.home };

  const optional = optionalByPath[path];
  if (optional && !isPublished(optional)) return notFound(path);

  const entry = staticPages[path];
  if (entry) {
    const breadcrumbs = path === paths.home ? [] : [home, { label: entry.label, path }];
    const jsonLd =
      path === paths.home ? [organizationLd(), websiteLd()] : [breadcrumbLd(breadcrumbs)];
    return {
      title: entry.title,
      description: entry.description,
      path,
      canonical: absoluteUrl(path),
      robots,
      ogType: 'website',
      image: absoluteUrl(OG_IMAGE),
      breadcrumbs,
      jsonLd,
      found: true,
    };
  }

  const productMatch = /^\/products\/([a-z0-9-]+)$/.exec(path);
  const product = productMatch?.[1] ? getProduct(productMatch[1]) : undefined;
  if (product) {
    const category = getCategory(product.category);
    const breadcrumbs = [
      home,
      { label: 'Products', path: paths.products },
      { label: product.name, path },
    ];
    const jsonLd: Record<string, unknown>[] = [breadcrumbLd(breadcrumbs)];
    // Product structured data only for real, published products — never samples, and never
    // with fabricated prices, ratings or availability.
    if (!product.sample) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.summary,
        category: category?.name,
        url: absoluteUrl(path),
        // Biotonic is a supplier: brand/manufacturer are added only when the client confirms them.
      });
    }
    return {
      title: `${product.name}${category ? ` — ${category.name}` : ''} | ${BRAND}`,
      description: product.summary,
      path,
      canonical: absoluteUrl(path),
      robots,
      ogType: 'product',
      image: absoluteUrl(OG_IMAGE),
      breadcrumbs,
      jsonLd,
      found: true,
    };
  }

  return notFound(path);
}

/** Pages listed in the sitemap: every found, indexable page. */
export function sitemapEntries(allPaths: string[]): string[] {
  return allPaths.filter((p) => getPageMeta(p).found);
}
