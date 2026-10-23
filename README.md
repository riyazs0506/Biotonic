# Biotonic — Corporate Website

Premium corporate website for **Biotonic**, a B2B supplier of chemical products.
React 19 + Vite + TypeScript, prerendered to static HTML for every route, served by a small
Node (Hono) server that also delivers the enquiry/quotation form by email.

> **Status:** engineering complete and verified; **launch is blocked on client content**
> (legal name, contact email, approved Privacy Policy/Terms, production domain). Run
> `VITE_CONTENT_MODE=release npm run content:check` for the live list. See
> [docs/HANDOVER.md](docs/HANDOVER.md).

## Quick start

```bash
npm ci
npm run dev            # site at http://localhost:5173 (Vite, hot reload)
npm run dev:server     # enquiry API at :8787 (in-memory "capture" mail — nothing is sent)
```

Production-like local run:

```bash
npm run build          # content check → client → SSR → prerender → server bundle
npm run start:local    # http://localhost:8787 (capture mail transport)
```

## Scripts

| Command                                       | What it does                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| `npm run build`                               | Draft build (placeholders visible, `noindex`).                                |
| `npm run build:release`                       | Public build. Fails while launch-blocking content is unresolved.              |
| `npm run deploy`                              | Build and deploy to Cloudflare Workers (`wrangler deploy`).                   |
| `npm run dev:worker`                          | Build and run locally in the Cloudflare Workers runtime.                      |
| `npm start`                                   | Run the production server (`dist/server/index.js`).                           |
| `npm run content:check`                       | Validate the catalogue and list every `[CLIENT TO CONFIRM]` item.             |
| `npm run typecheck` / `lint` / `format:check` | Strict TypeScript, ESLint (incl. jsx-a11y strict), Prettier.                  |
| `npm test`                                    | Vitest: unit, component (Testing Library) and server/API tests.               |
| `npm run test:e2e`                            | Playwright on desktop + mobile against the production build (incl. axe a11y). |
| `npm run check:links`                         | Every internal link/asset in the prerendered HTML resolves.                   |
| `npm run check:release-render`                | Builds in release mode and fails if any placeholder would be public.          |
| `npm run scan:secrets` / `audit:deps`         | Secret scan of the source tree; `npm audit` of runtime deps.                  |
| `npm run verify`                              | Everything above in sequence (CI entry point).                                |

## Project structure

```
src/
  content/          ← all business content (edit here, not in components)
    catalogue/      ← products.json, categories.json + schema
    site.ts company.ts leadership.ts quality.ts industries.ts resources.ts legal.ts
    pending.ts      ← `pending()` markers for unconfirmed facts
  components/       ← ui/ (design system), layout/, hero/, products/, enquiry/, brand/
  pages/            ← one component per route
  app/              ← route table, root layout, error boundaries
  lib/              ← catalogue logic, SEO metadata, publication rules, env
  shared/enquiry.ts ← validation schema shared by browser and server
  styles/           ← design tokens + global base
server/             ← enquiry API (api.ts, portable), Node static server (app.ts), mail, security
worker/             ← Cloudflare Workers entry (API only; static files via Workers Static Assets)
scripts/            ← prerender, content validation, link check, secret scan, OG image
tests/e2e/          ← Playwright journeys + accessibility
docs/               ← handover, security/threat model, deployment, content, SEO, QA
brand-source/       ← full-resolution logo masters extracted from the brand presentation
```

## Documentation

- [Handover & ownership transfer](docs/HANDOVER.md)
- [Deployment, domain, rollback](docs/DEPLOYMENT.md)
- [Security configuration & threat model](docs/SECURITY.md)
- [Updating content](docs/CONTENT-GUIDE.md)
- [SEO launch checklist](docs/SEO-CHECKLIST.md)
- [QA & test report](docs/QA-REPORT.md)
