import type { PageMeta } from './seo';

/**
 * Client-side counterpart of the prerendered <head>: keeps title, description, canonical,
 * robots, Open Graph/Twitter tags and JSON-LD in sync after in-app navigation.
 * Uses DOM APIs only (textContent / setAttribute) — never innerHTML.
 */
function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function applyMeta(meta: PageMeta, doc: Document = document) {
  doc.title = meta.title;
  upsertMeta('name', 'description', meta.description);
  upsertMeta('name', 'robots', meta.robots);
  upsertMeta('property', 'og:title', meta.title);
  upsertMeta('property', 'og:description', meta.description);
  upsertMeta('property', 'og:url', meta.canonical);
  upsertMeta('property', 'og:type', meta.ogType === 'product' ? 'product' : 'website');
  upsertMeta('property', 'og:image', meta.image);
  upsertMeta('name', 'twitter:title', meta.title);
  upsertMeta('name', 'twitter:description', meta.description);

  let canonical = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = doc.createElement('link');
    canonical.rel = 'canonical';
    doc.head.appendChild(canonical);
  }
  canonical.href = meta.canonical;

  doc.head.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove());
  for (const data of meta.jsonLd) {
    const script = doc.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    doc.head.appendChild(script);
  }
}
