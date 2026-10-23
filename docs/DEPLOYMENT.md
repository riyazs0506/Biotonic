# Deployment, domain, backup and rollback

The site is prerendered static HTML plus one API endpoint, `POST /api/enquiry`. It runs on
**Cloudflare Workers** (current setup) or on any Node ≥ 22 / Docker host. The client should own
the hosting account.

## Cloudflare Workers (current deployment)

The repository deploys to Cloudflare Workers with **Workers Builds** (Git integration):

| Setting (Cloudflare dashboard → Worker → Settings → Build) | Value                                                                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Build command                                              | `npm run build` (draft, for client review) or `npm run build:release` (public launch)                                                |
| Deploy command                                             | `npx wrangler deploy`                                                                                                                |
| Build variables                                            | `VITE_SITE_URL` = the site's public URL (e.g. `https://biotonic.<account>.workers.dev`); for launch also `VITE_CONTENT_MODE=release` |

How it runs (`wrangler.jsonc`):

- Pages, assets and the 404 page are served by **Workers Static Assets** from `dist/client`.
  Unknown URLs get the branded `404.html` with a real HTTP 404; `/about/` redirects to `/about`.
- Security headers for static pages come from `dist/client/_headers`, generated at build time
  from the same list the server uses (`server/security.ts`).
- Only `/api/*` runs the Worker (`worker/index.ts`), which runs the same enquiry API as the Node server.
- Workers cannot use SMTP, so email uses **Resend** (HTTP API).

### Enabling the enquiry form on Cloudflare

Until this is done the form honestly reports "temporarily unavailable" (HTTP 503).

1. Create a Resend account (client-owned), add and verify the sending domain (DNS records).
2. Create an API key with **sending access only**.
3. Store it as a secret — never in the repo:
   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```
   (or Dashboard → Worker → Settings → Variables and Secrets → add as **Secret**).
4. In `wrangler.jsonc` → `vars`, set `MAIL_TRANSPORT` to `"resend"`, `MAIL_FROM`
   (e.g. `"Biotonic Website <website@your-domain>"`) and `ENQUIRY_TO` (the client inbox).
5. Commit, push → Workers Builds redeploys. Send one test enquiry and confirm it arrives.

### Custom domain

Dashboard → Worker → Settings → Domains & Routes → add the domain (the zone must be on
Cloudflare). Then set `VITE_SITE_URL` to `https://www.<domain>`, enable **Always Use HTTPS**
on the zone, and add rate-limiting / bot rules in the WAF for `/api/enquiry` (the in-app rate
limit is per Worker isolate, so the WAF rule is the reliable control on Cloudflare).

### Rollback

Dashboard → Worker → Deployments → select a previous deployment → **Rollback**, or
`npx wrangler rollback`.

### Local check of the Cloudflare setup

```bash
npm run dev:worker     # builds, then serves via the local Workers runtime
```

## Alternative: Node server / Docker

### 1. Build

```bash
npm ci
VITE_CONTENT_MODE=release VITE_SITE_URL=https://www.<domain> npm run build:release
```

`build:release` refuses to build while launch-blocking content is missing, and prerendering
fails if any `[CLIENT TO CONFIRM]` marker would be published.

Output: `dist/client` (static site), `dist/server/index.js` (server).

### 2. Run

```bash
NODE_ENV=production SITE_URL=https://www.<domain> TRUST_PROXY=true FORCE_HTTPS=true \
MAIL_TRANSPORT=smtp SMTP_HOST=… SMTP_USER=… SMTP_PASS=… MAIL_FROM=… ENQUIRY_TO=… \
npm start
```

Docker alternative:

```bash
docker build --build-arg VITE_SITE_URL=https://www.<domain> -t biotonic-web:<version> .
docker run -p 8787:8787 --env-file production.env biotonic-web:<version>
```

Health check: `GET /api/health` → `{"ok":true,"mail":"configured"}`.
Set every variable from `.env.example` in the host's secret manager — never in the repository.

### 3. Domain & HTTPS

1. Register/confirm the domain in the **client's** registrar account.
2. Point `www` (CNAME) and the apex (A/ALIAS) to the host as the host instructs.
3. Enable the host's managed TLS certificate (or Caddy/Let's Encrypt on a VPS).
4. Choose one canonical host (recommended `https://www.<domain>`); redirect the other to it at the host/DNS level.
5. Set `SITE_URL` and `VITE_SITE_URL` to that exact origin, rebuild, deploy.
6. Email: add SPF, DKIM and DMARC records for the sending domain from the email provider.

### 4. Verify after each deploy

```bash
curl -sI https://www.<domain>/ | grep -i -E 'content-security|strict-transport'
curl -s -o /dev/null -w '%{http_code}\n' https://www.<domain>/no-such-page   # expect 404
curl -s https://www.<domain>/robots.txt
curl -s https://www.<domain>/api/health
```

Then submit one real test enquiry and confirm it arrives at `ENQUIRY_TO`.

### 5. Backup

There is no database. What must be preserved:

- **Source code** — the Git repository (client-owned; enable branch protection on `main`).
- **Secrets** — in the host's secret manager / client password manager.
- **Enquiries** — live in the mailbox; follow the mailbox provider's retention/backup policy.
- **Brand masters** — `brand-source/` (request vector SVG/EPS originals from the designer too).

### 6. Rollback

- Tag every release: `git tag v1.0.0 && git push --tags`; build images as `biotonic-web:<tag>`.
- Rollback = redeploy the previous tag/image (most hosts offer one-click "redeploy previous").
- Because the site is stateless, rollback has no data-migration risk.
