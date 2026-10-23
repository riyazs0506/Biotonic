# Security configuration & threat model

## Architecture and trust boundaries

```
Browser ──HTTPS──▶ [TLS proxy / CDN] ──▶ Node server (Hono)
                                          ├─ static, prerendered HTML/CSS/JS  (public, read-only)
                                          └─ POST /api/enquiry ──SMTP/TLS──▶ email provider ──▶ ENQUIRY_TO inbox
```

| Boundary                | Trusted side                 | Untrusted input                                      |
| ----------------------- | ---------------------------- | ---------------------------------------------------- |
| Browser → server        | Server code, server env      | Everything in the request: body, headers, IP, Origin |
| Server → email provider | SMTP credentials (env only)  | Enquiry text is placed in the _body_ only            |
| Build → browser         | Content files, `VITE_*` vars | — (all `VITE_*` values are public by design)         |

There is **no database, no login, no cookies, no admin panel** and no persistent storage of
personal data on the web server. Enquiries exist only as emails in the client's inbox.

## Principal threats and controls

| Threat                                                | Control                                                                                                                                                      | Where                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Email header injection (e.g. `Bcc:` via name/company) | Single-line fields stripped of CR/LF/control chars; plain-text body; recipient fixed in env; nodemailer header encoding                                      | `src/shared/enquiry.ts`, `server/mailer.ts`                      |
| Using the form as an open relay                       | Recipient (`ENQUIRY_TO`) and sender (`MAIL_FROM`) are server config, never request fields                                                                    | `server/config.ts`                                               |
| Spam / bots                                           | Honeypot field, minimum fill time (2.5 s) and 24 h form expiry, per-IP + global rate limits, 16 KB body limit, JSON-only                                     | `server/app.ts`                                                  |
| Cross-site form abuse                                 | Origin must match `SITE_URL`/`ALLOWED_ORIGINS` (required in production). No cookies → classic CSRF not applicable                                            | `server/app.ts`                                                  |
| XSS                                                   | React escaping; `dangerouslySetInnerHTML` banned by lint rule; JSON-LD escaped (`<`→`<`); strict CSP without `unsafe-inline`                                 | `eslint.config.js`, `scripts/prerender.ts`, `server/security.ts` |
| Clickjacking                                          | `frame-ancestors 'none'`, `X-Frame-Options: DENY`                                                                                                            | `server/security.ts`                                             |
| Path traversal                                        | Static paths resolved and confined to `dist/client`                                                                                                          | `server/app.ts`                                                  |
| Information disclosure                                | Generic error messages; no stack traces; logs contain event names and references only (no names/emails/messages); config errors name variables, never values | `server/app.ts`, `server/config.ts`                              |
| Fake success                                          | UI shows success only after the server reports the provider accepted the message; 503 when mail is not configured or fails                                   | `server/app.ts`, `EnquiryForm.tsx`                               |
| Duplicate submissions                                 | Button disabled while sending + `Idempotency-Key` (15 min)                                                                                                   | `EnquiryForm.tsx`, `server/rateLimit.ts`                         |
| Secret leakage                                        | Secrets only in server env; `.env*` git-ignored; secret scan script; `capture` transport refused in production                                               | `.gitignore`, `scripts/scan-secrets.mjs`                         |
| Downgrade / sniffing                                  | HTTPS redirect + HSTS (`FORCE_HTTPS`), `upgrade-insecure-requests`, `nosniff`                                                                                | `server/security.ts`                                             |

### Response headers (verified by tests)

`Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'[; upgrade-insecure-requests]`,
`Strict-Transport-Security` (when `FORCE_HTTPS`), `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`.
No CORS headers are sent — the API is same-origin only.

If analytics or a third-party widget is added later, the CSP must be extended deliberately.

## Operational guidance

- **SMTP account:** use a dedicated sending identity with least privilege (send-only API/SMTP key
  scoped to one verified domain). Configure SPF, DKIM and DMARC for the sending domain.
- **Rate limiting** is in-memory: correct for one instance. If you run several instances, add the
  platform's WAF/rate limiting or a shared store (Redis) — see `server/rateLimit.ts`.
- **`TRUST_PROXY=true`** only when a proxy you control sets `X-Forwarded-For`; otherwise clients
  could spoof their IP to evade rate limits.
- **Logging:** JSON lines to stdout (`enquiry_delivered`, `enquiry_rejected`, …). Keep platform
  log retention short (e.g. 30 days). IP addresses are not logged.
- **Dependencies:** `npm run audit:deps` monthly and before every release; update with
  `npm outdated` → upgrade on a branch → `npm run verify` → deploy. Add GitHub Dependabot and
  gitleaks (or GitHub secret scanning) to the repository's CI.

## Cloudflare specifics

- Static pages get their headers from `dist/client/_headers` (generated from `server/security.ts`).
- The Worker trusts `CF-Connecting-IP` for rate limiting; HTTPS is enforced at the edge.
- `RESEND_API_KEY` is a Worker **secret**; `wrangler.jsonc` holds only non-secret vars.
- Workers isolates are short-lived, so add a WAF rate-limiting rule for `POST /api/enquiry`.

## Outstanding risks

1. Email not yet configured — the form returns 503 until Resend (Cloudflare) or SMTP (Node) is set up.
2. No CAPTCHA. Honeypot + timing + rate limits stop common bots; add Cloudflare Turnstile if spam appears (requires CSP update).
3. In-memory rate limit resets on restart and is per-instance.
4. Privacy Policy and Terms are drafts requiring legal review (release build is blocked until approved).
