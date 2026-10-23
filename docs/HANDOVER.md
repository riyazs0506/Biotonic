# Client handover

## What is delivered

- Complete source code (this repository), README and the documents in `docs/`.
- All 13 routes: Home, Products, Product detail, About, Leadership, Quality, Industries,
  Resources, Contact, Request a Quote, Privacy Policy, Terms, branded 404.
- Design system (tokens in `src/styles/tokens.css`, reusable components in `src/components/ui`).
- "The Living Reaction" hero (SVG + CSS, reduced-motion and off-screen pausing).
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
- **Logo:** the real artwork is used everywhere (never re-typed). Header uses Lockup B
  (continuous), footer uses the reversed continuous version. Minimum 120 px width respected.
- **Hero:** CSS/SVG rather than WebGL. Measured result: zero total blocking time, CLS 0;
  WebGL/Three.js would add ~150 KB+ JS for little visual gain.

## Demo content

Draft builds show realistic **demo content** (sample founder, contact details, catalogue, industries,
capabilities, legal wording) so the client can review a complete-looking site. All of it lives in
`src/content/demo/`, is never shown as "[CLIENT TO CONFIRM]", and is **physically excluded from
release builds** (verified: no demo text in release HTML, JS or SSR output). See CONTENT-GUIDE.md.

## Blocked on client information

Run `npm run content:check` for the authoritative list. Summary:

| Needed                                                               | Blocks launch?          | Effect until supplied                                             |
| -------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------- |
| Production domain                                                    | **Yes**                 | Release build refuses to run                                      |
| Registered legal company name                                        | **Yes**                 | —                                                                 |
| Public enquiry email                                                 | **Yes**                 | —                                                                 |
| Privacy Policy & Terms legal approval + missing clauses              | **Yes**                 | —                                                                 |
| Email provider / SMTP credentials + recipient inbox                  | **Yes** (operationally) | Form returns "temporarily unavailable" (503) — never fake success |
| Product catalogue (categories, specs, packaging, documents)          | No                      | Catalogue shows "being prepared" + quote CTA                      |
| Founder name, title, portrait, biography                             | No                      | Leadership page and homepage section unpublished                  |
| Company history, mission, vision, capabilities, customer approach    | No                      | Those sections hidden                                             |
| Quality overview, process, certifications, documentation             | No                      | Quality page unpublished                                          |
| Industries served                                                    | No                      | Industries page unpublished                                       |
| Technical documents                                                  | No                      | Resources page unpublished                                        |
| Phone, WhatsApp, address, hours, social links                        | No                      | Hidden                                                            |
| Vector logo masters (SVG/EPS)                                        | No                      | Current PNGs are high-resolution extractions from the PDF         |
| Approval of website copy (hero, About introduction, enquiry wording) | Recommended             | Copy avoids factual claims but should be signed off               |

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
