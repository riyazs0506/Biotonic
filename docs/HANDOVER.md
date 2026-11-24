# Client handover

## What is delivered

- Complete source code (this repository), README and the documents in `docs/`.
- All 13 routes: Home, Products, Product detail, About, Leadership, Quality, Industries,
  Resources, Contact, Request a Quote, Privacy Policy, Terms, branded 404.
- Design system (tokens in `src/styles/tokens.css`, reusable components in `src/components/ui`).
- **Hero:** the promise, two next steps ("Request a quote", "Explore products"), the trust strip
  and the molecule viewer. The quote form still accepts pre-filled requirement links
  (`/request-a-quote?product=…&market=…&qty=…&freq=…`, option keys only, parsed by
  `src/lib/requirement.ts`), for use in campaigns or WhatsApp replies.
- **Molecule viewer (hero visual):** a lab-instrument dial — measurement rings, an orbiting
  marker and readouts (market, molar mass, elements, atom/bond count) — with a ball-and-stick
  molecule for the chosen market: acetic acid (textile), a water-repellent silane (construction),
  ethylene glycol (industrial). It assembles from a cloud of atoms, rotates, follows the pointer
  and can be dragged to spin (with inertia). When the market changes, it bursts apart and
  re-forms as the next molecule while a scan sweeps the dial, with a plain-words caption.
  Chips below the dial (Textile · Construction · Industrial) pick the market. Until the visitor
  picks one, the viewer tours the markets every 6.5 s (a progress bar fills the active chip). The
  tour pauses on hover, keyboard focus or off-screen, stops for good on the first pick, and never
  runs under reduced motion.
  It is a light 2D canvas with no 3D engine or images, so it runs the same on phones. It pauses
  off-screen and, under reduced motion, shows a still frame that can still be dragged. Molecules
  are in `src/components/hero/molecules.ts`: real formulas and bond geometry, with molar mass
  computed from IUPAC atomic weights, all checked by unit tests. They illustrate each market's
  chemistry and are not claims about what a product contains.
- **Phone layout (≤ 639 px):** a tighter spacing and type scale (overrides in
  `src/styles/tokens.css`), product and audience cards as swipeable rows with the next card
  peeking in (`.swipe-row` in `src/styles/global.css`), two-up stats and awards, and a two-column
  footer. Pages are 16–36% shorter on phones (25% across all pages; home 12,932 → 8,224 px).
  Tablets and laptops are unchanged: every laptop page measured the same height before and after,
  apart from the home hero.
- Secure enquiry/quotation service with email delivery (`server/`).
- Prerendering, sitemap, robots, structured data, security headers, real 404s.
- Automated tests (unit, component, API, end-to-end, accessibility) and CI-ready `npm run verify`.
- Brand assets: official logo variants extracted at full resolution from the approved
  presentation (`brand-source/`, optimised copies in `public/brand/`).

## Design decisions

- **Palette** exactly as the brand presentation (Carbon `#0E1016`, Biotonic Green `#109255`,
  Reaction Green `#21BF75`, Lab White `#FBFAF7`). Two darker greens (`#0B7443`, `#0D7A47`) are
  used only where small text or white-on-green buttons need WCAG AA contrast.
- **Typography:** Inter for all interface text (per the brand). Cormorant Garamond was evaluated
  and adopted for large editorial headlines only — it gives the "royal, editorial" register while
  the wide geometric logo remains the only extended-caps element. Remove it by deleting the two
  `@fontsource/cormorant-garamond` imports in `src/main.tsx` and changing `--font-display`.
- **Logo (updated November 2026):** the client-supplied wordmark is used everywhere (never
  re-typed). Master: `brand-source/logo-2026-11-master.png`; full-colour (header), reversed
  (footer, with Reaction Green "ON") and mono-white variants in `public/brand/`. The favicon and
  app icons use the green "ON" cut from the wordmark. The previous test-tube logo is archived in
  `brand-source/previous-logo-2026-10/`. Note: the supplied artwork's green (~#08A337) and black
  differ slightly from the brand-guide palette (#109255 / #0E1016) — confirm which is current, and
  request vector (SVG) masters and an official icon.
- **Hero performance:** the earlier 3D product model (three.js) was removed in favour of the
  molecule viewer; desktop page weight fell from 581 KiB to 273 KiB. Measured: desktop
  Lighthouse 100, mobile 96 (TBT 0 ms, CLS 0).

## Demo content

Draft builds show realistic **demo content** (sample founder, contact details, catalogue, industries,
capabilities, legal wording) so the client can review a complete-looking site. All of it lives in
`src/content/demo/`, is never shown as "[CLIENT TO CONFIRM]", and is **physically excluded from
release builds** (verified: no demo text in release HTML, JS or SSR output). See CONTENT-GUIDE.md.

## Confirmed by the Strategy Framework (November 2026)

"Biotonic — Strategy Framework" (Visionary X) supplied these facts, now live in `src/content/`
and published in release builds:

- Founder **Keerthi Vasan**: biography, career timeline, education, awards, "industrial expert &
  deal maker" positioning and personal brand statement (marked _draft_ in the deck).
- Founded **2024**, on the 20+ year legacy of **TMR and Co** (Tiruppur); principal partners
  **Zydex, Pidilite and India Glycols**.
- Three markets (textile, construction, industrial chemicals); region (Tiruppur, Erode and
  Coimbatore belt, then wider Tamil Nadu and South India); market figures with sources.
- Positioning, value proposition, USPs, price positioning, audiences and "what each side gets",
  brand idea "The right chemistry. The right deal.", tone of voice.

Not published (internal strategy): SWOT, competitor analysis, KPIs, 90-day rollout, content pillars.

**To confirm with the client**

1. **Founding year:** slides 3, 4 and 7 say 2024; the founder timeline (slide 17) says 2023. The
   site uses 2024 everywhere.
2. **Principal names:** the site names Zydex, Pidilite and India Glycols in text (no logos). The
   strategy itself plans co-branding "with their approval" — confirm principals are happy to be named.
3. **Personal brand statement** is marked _draft_ in the deck.
4. **Customer journey** (samples, trials, site visits, stock alerts, dealer programme) comes from
   the strategy's planned touchpoints — confirm these services are offered today.

## Blocked on client information

Run `npm run content:check` for the authoritative list. Summary:

| Needed                                                  | Blocks launch?          | Effect until supplied                                             |
| ------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------- |
| Production domain                                       | **Yes**                 | Release build refuses to run                                      |
| Registered legal company name                           | **Yes**                 | —                                                                 |
| Public enquiry email                                    | **Yes**                 | —                                                                 |
| Privacy Policy & Terms legal approval + missing clauses | **Yes**                 | —                                                                 |
| Email provider (Resend/SMTP) + recipient inbox          | **Yes** (operationally) | Form returns "temporarily unavailable" (503) — never fake success |
| Product catalogue (products, specs, packaging, brand)   | No                      | Catalogue shows "being prepared" + quote CTA                      |
| Founder portrait (photo shoot) and LinkedIn URL         | No                      | Monogram shown; no profile link                                   |
| Certifications, order documentation (COA/SDS)           | No                      | Those sections hidden                                             |
| Technical documents                                     | No                      | Resources page unpublished                                        |
| Phone, WhatsApp, address, hours, social links           | No                      | Hidden (incl. the WhatsApp button)                                |
| Vector logo masters (SVG/EPS)                           | No                      | Current PNGs are high-resolution extractions from the PDF         |

## Ownership transfer checklist

The client must hold **owner/admin** rights; the agency should hold delegated access only.

- [ ] **Git repository** created in the client's GitHub/GitLab organisation; agency invited as collaborator; branch protection on `main`.
- [ ] **Domain registrar** account in the client's name, with 2FA and auto-renew.
- [ ] **DNS** managed in the client's account.
- [ ] **Hosting** account owned by the client; agency added as team member.
- [ ] **Email provider** (SMTP/API) owned by the client; sending domain verified (SPF/DKIM/DMARC).
- [ ] **Enquiry inbox** (`ENQUIRY_TO`) is a client-controlled mailbox, ideally a shared address (e.g. sales@).
- [ ] **Google Search Console / Bing** verified by the client; agency added as user.
- [ ] **Analytics** (if added later) owned by the client; update CSP and Privacy Policy first.
- [ ] Secrets stored in the client's password manager / host secret store — never in documents or chat.
- [ ] Agency access reviewed/revoked at the end of the support period.

## Known limitations

- Demo content (incl. the six demo products) exists only for client review; it is excluded from release builds.
- Rate limiting is per-instance and in-memory (see SECURITY.md).
- No CMS: content is edited in code-adjacent files (`src/content/`) and redeployed. A headless CMS
  can be added later if non-technical staff need to edit frequently.
- No photography was supplied; the design uses brand-derived illustration. Professional product/
  facility photography would strengthen the About and product pages.
- The site is English-only (`lang="en-GB"`); confirm preferred English variant.
- JavaScript is ~130 KB gzip (React 19 + router). Pages are fully readable without JS; the form requires JS.
