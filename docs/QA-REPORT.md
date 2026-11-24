# QA & test report

Run date: 22 Oct 2026 · Node 24.21 · macOS · Chromium (Playwright) · draft content mode unless noted.
Every result below comes from a command that was actually executed; re-run with `npm run verify`.

## Summary

| Check                                                                                         | Command                                           | Result                                                 |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| Strict TypeScript                                                                             | `npm run typecheck`                               | ✅ 0 errors                                            |
| ESLint (typescript-eslint strict, react-hooks, jsx-a11y strict, no `dangerouslySetInnerHTML`) | `npm run lint`                                    | ✅ 0 problems                                          |
| Formatting                                                                                    | `npm run format:check`                            | ✅                                                     |
| Unit / component / API tests                                                                  | `npm test`                                        | ✅ 114 / 114                                           |
| End-to-end (desktop 1440×900 + Pixel 7) incl. axe                                             | `npm run test:e2e`                                | ✅ 105 passed, 3 skipped (device-specific)             |
| Production build + prerender                                                                  | `npm run build`                                   | ✅ 18 pages, sitemap 17 URLs                           |
| Release-mode render (no placeholders public)                                                  | `npm run check:release-render`                    | ✅ 11 pages, samples and unconfirmed pages unpublished |
| Release content gate                                                                          | `VITE_CONTENT_MODE=release npm run content:check` | ⛔ fails as designed — 14 launch-blocking client items |
| Internal links & assets                                                                       | `npm run check:links`                             | ✅ 451 links across 18 pages                           |
| Secret scan                                                                                   | `npm run scan:secrets`                            | ✅ none found                                          |
| Dependency audit                                                                              | `npm audit`                                       | ✅ 0 vulnerabilities                                   |

## What the tests cover

- **Routes:** all 12 public routes prerendered with title, description, canonical, OG tags, single `<h1>`; unique titles; no horizontal scroll at either viewport; no console errors, page errors or missing assets on any page.
- **Errors:** unknown URL → HTTP 404 + branded page + `noindex`; unknown product → 404 (server) and not-found state (client navigation); trailing-slash 301; route error boundary; catalogue empty state; search empty state with recovery.
- **Navigation:** primary/mobile/footer links, hero CTAs, skip link focus, mobile menu (focus trap, Escape, closes on navigation).
- **Catalogue:** search (case/accent-insensitive, multi-term), category filters synced to the URL, deep-linked filters after hydration, product → prefilled quote.
- **Enquiries:** client validation with accessible errors and focus; real end-to-end delivery through the server (capture transport) with reference number; 503/network failure keeps data and retry works; duplicate submission blocked; server field errors displayed.
- **Server/API:** recipient cannot be overridden; header injection neutralised; honeypot; timing; stale tokens; Origin check; content type; body size; per-IP rate limit with `Retry-After`; 503 when mail is unconfigured or the provider fails (no personal data logged); idempotency; security headers; HTTPS redirect uses configured origin (not Host); path traversal; immutable asset caching; production config guards.
- **SEO:** sitemap contents, draft robots, JSON-LD validity and types, no prices/ratings/reviews, Product schema never for samples.
- **Hero:** CTAs reach the quote form and catalogue; market chips switch the molecule; the viewer tours the markets until a pick (never under reduced motion); pre-filled quote links fill the form; the molecule viewer is the only visual (no 3D engine or images downloaded), re-forms into the chosen market's molecule with live readouts (molar mass, atoms/bonds), and under reduced motion paints a still frame that can still be turned by dragging; ring animation off under reduced motion. Molecule data is checked for formula, valence, bond lengths, connectivity and atom clashes.
- **Phone layout:** product and audience rows swipe sideways on phones and form grids on laptops; no page scrolls horizontally at either viewport.
- **Motion:** hero animations off under `prefers-reduced-motion`, on by default.
- **Accessibility (axe-core, WCAG 2.0/2.1/2.2 A+AA + best practice):** 10 pages × 2 viewports, form error state, open mobile menu — 0 violations.

## Performance (Lighthouse 12.6.1, local production server with compression)

Measured 2026-11-24 with the molecule-viewer hero and the compact phone layout (italic display font preloaded to keep CLS at 0). SEO in draft builds is 69 by design (`noindex`); release builds score 100.

|                                                   | Performance | Accessibility | Best practices | SEO | FCP   | LCP   | CLS | TBT  |
| ------------------------------------------------- | ----------- | ------------- | -------------- | --- | ----- | ----- | --- | ---- |
| Mobile (simulated slow 4G, home, molecule viewer) | 96          | 100           | 100            | 100 | 1.7 s | 2.6 s | 0   | 0 ms |
| Desktop (home, molecule viewer)                   | 100         | 100           | 100            | 100 | 0.4 s | 0.6 s | 0   | 0 ms |

Fixed during measurement: the server was not compressing responses (mobile score was 77);
gzip/brotli compression was added. Real-world numbers depend on the final host/CDN — measure
again after deployment with PageSpeed Insights.

On this machine, the first Lighthouse run straight after a fresh build sometimes shows a single
one-off long task (mobile TBT up to ~760 ms; seen both before and after the 3D model was removed).
Repeat runs are stable at the figures above (3 of 3 desktop, 2 of 3 mobile).

Bundle: JS 130 KB gzip (React 19 + React Router ≈ 85 %), CSS 10.5 KB gzip, fonts self-hosted
with `unicode-range` subsets and preloads for the two above-the-fold faces.

## Not covered / manual follow-ups

- Real SMTP delivery (no credentials yet) — test one enquiry after configuring the provider.
- Safari/Firefox and physical devices were not automated (Chromium only); do a manual pass.
- Screen-reader walkthrough (VoiceOver/NVDA) beyond automated checks is recommended.
- Automated a11y tools catch a subset of WCAG issues; this is not a full conformance audit.
- Content correctness can only be verified once the client supplies it.
