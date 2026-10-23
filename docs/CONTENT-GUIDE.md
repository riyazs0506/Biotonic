# Updating content

All business content lives in `src/content/`. Components never contain company facts.

## The `pending()` rule and demo content

Any fact the client has not confirmed is written as `pending('what is needed', demo.<group>.<key>)`.

- **Draft builds** (for client review) show the **demo value** from `src/content/demo/index.ts`,
  so every page looks complete. No "[CLIENT TO CONFIRM]" markers are ever shown to visitors.
- **Release builds** never contain demo text: `vite.config.ts` swaps the demo module for an
  empty one at build time, pending sections are hidden, and pages that depend on them are
  unpublished. `npm run content:check` fails for launch-critical items (legal name, email,
  Privacy Policy, Terms, domain) and lists every remaining pending item.

Demo values are **illustrative only** (a sample founder name, address, phone, catalogue…).
To confirm a fact, replace the whole `pending(...)` with the approved value:

```ts
// src/content/site.ts
email: pending('Public sales / enquiry email address', demo.site.email),
// becomes
email: 'sales@biotonic.example',
```

Never copy a demo value into real content unless the client has confirmed it.

## Products

Edit `src/content/catalogue/categories.json` and `products.json` (empty until the client supplies the catalogue). The demo catalogue lives in `src/content/demo/catalogue-*.json` and is excluded from release builds.

```json
{
  "slug": "sodium-hydroxide-flakes",
  "name": "Sodium Hydroxide Flakes",
  "category": "alkalis",
  "summary": "One or two sentences (max 220 characters).",
  "description": ["Paragraph one.", "Paragraph two."],
  "applications": ["Water treatment"],
  "specifications": [{ "label": "Purity", "value": "≥ 98%" }],
  "packaging": ["25 kg HDPE bags"],
  "documents": [{ "label": "Safety Data Sheet (PDF)", "href": "/resources/naoh-sds.pdf" }],
  "featured": true
}
```

- `slug`: lowercase-with-hyphens; becomes the URL `/products/<slug>`. Don't change it after launch (it breaks links/SEO).
- Up to 3 products with `"featured": true` appear on the homepage.
- When the real catalogue is entered, delete `src/content/demo/catalogue-*.json` entries (or leave them — release builds never include them).
- Put PDFs in `public/resources/` and reference them as `/resources/<file>.pdf`.
- Run `npm run content:check` — it validates every field and cross-reference.

## Other content

| File            | Content                                                           | Page(s)                 |
| --------------- | ----------------------------------------------------------------- | ----------------------- |
| `site.ts`       | Legal name, email, phone, WhatsApp, address, hours, socials       | Footer, Contact, schema |
| `company.ts`    | Introduction, history, mission, vision, principles, capabilities  | Home, About             |
| `leadership.ts` | Founder name, title, portrait, biography, philosophy              | Home, Leadership        |
| `quality.ts`    | Quality overview, process, certifications, documentation          | Quality                 |
| `industries.ts` | Industries served                                                 | Home, Industries        |
| `resources.ts`  | Downloadable technical documents                                  | Resources               |
| `legal.ts`      | Privacy Policy, Terms (set `approved: true` after legal sign-off) | Legal pages             |

Founder portrait: save as `public/images/leadership/founder.webp` (≥ 1200×1500) and set
`portrait: { src: '/images/leadership/founder.webp', alt: '…', width: 1200, height: 1500 }`.

Page titles/descriptions are in `src/lib/seo.ts`.

## Publishing a change

1. Edit content → `npm run content:check` → `npm run build` → `npm run start:local` to review.
2. Commit, then deploy with `build:release` (see DEPLOYMENT.md).
