# SEO implementation & launch checklist

## Implemented (verified by tests)

- Every route is **prerendered** to static HTML; crawlers receive full content and `<head>` without JavaScript.
- Unique `<title>` and meta description per page (unit-tested for uniqueness and length).
- Absolute `<link rel="canonical">`, Open Graph and Twitter card tags, 1200×630 `og-image.png`.
- One `<h1>` per page, logical heading order, descriptive link text, alt text on images.
- Robots: draft builds → `noindex, nofollow` + `robots.txt` `Disallow: /`; release builds → indexable, `robots.txt` with sitemap.
- `sitemap.xml` generated from the published routes only (no 404, no unpublished pages, no samples).
- JSON-LD: `Organization` + `WebSite` (home), `BreadcrumbList` (inner pages), `Product` only for real published products — **no prices, offers, ratings or reviews** are emitted.
- Real HTTP 404 for unknown URLs (incl. unknown product slugs), `noindex` on the 404 page.
- Trailing-slash URLs 301-redirect to the canonical form.
- Lighthouse SEO score 100 (mobile and desktop), see QA-REPORT.md.

## Before launch

- [ ] Final domain chosen; `VITE_SITE_URL`/`SITE_URL` set; `build:release` passes.
- [ ] Real products, categories and descriptions entered (descriptive slugs).
- [ ] Organization facts confirmed (legal name, email, phone, social profiles → `sameAs`).
- [ ] Review page titles/descriptions in `src/lib/seo.ts` with the client.
- [ ] Spot-check `view-source:` of a few live pages: title, canonical, robots `index`.
- [ ] Validate structured data at https://validator.schema.org and Google's Rich Results Test.

## After launch — Google Search Console

1. Sign in at https://search.google.com/search-console with the **client's** Google account.
2. Add a **Domain property** for `<domain>` and verify with the DNS TXT record at the registrar
   (preferred — no code change needed).
3. Sitemaps → submit `https://www.<domain>/sitemap.xml`.
4. URL Inspection → request indexing for the homepage and `/products`.
5. Add the agency as a _restricted/full user_ — the client stays _owner_.
6. Repeat for Bing Webmaster Tools (can import from Search Console).

Monitor Coverage/Pages and Core Web Vitals reports monthly.
