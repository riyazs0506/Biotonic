# Deployment, domain, backup and rollback

The site is one Node process serving prerendered HTML plus `POST /api/enquiry`. Any host that
runs Node ≥ 22 or a Docker container works (e.g. Render, Railway, Fly.io, DigitalOcean App
Platform, a VPS behind Caddy/Nginx). The client should own the hosting account.

## 1. Build

```bash
npm ci
VITE_CONTENT_MODE=release VITE_SITE_URL=https://www.<domain> npm run build:release
```

`build:release` refuses to build while launch-blocking content is missing, and prerendering
fails if any `[CLIENT TO CONFIRM]` marker would be published.

Output: `dist/client` (static site), `dist/server/index.js` (server).

## 2. Run

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

## 3. Domain & HTTPS

1. Register/confirm the domain in the **client's** registrar account.
2. Point `www` (CNAME) and the apex (A/ALIAS) to the host as the host instructs.
3. Enable the host's managed TLS certificate (or Caddy/Let's Encrypt on a VPS).
4. Choose one canonical host (recommended `https://www.<domain>`); redirect the other to it at the host/DNS level.
5. Set `SITE_URL` and `VITE_SITE_URL` to that exact origin, rebuild, deploy.
6. Email: add SPF, DKIM and DMARC records for the sending domain from the email provider.

## 4. Verify after each deploy

```bash
curl -sI https://www.<domain>/ | grep -i -E 'content-security|strict-transport'
curl -s -o /dev/null -w '%{http_code}\n' https://www.<domain>/no-such-page   # expect 404
curl -s https://www.<domain>/robots.txt
curl -s https://www.<domain>/api/health
```

Then submit one real test enquiry and confirm it arrives at `ENQUIRY_TO`.

## 5. Backup

There is no database. What must be preserved:

- **Source code** — the Git repository (client-owned; enable branch protection on `main`).
- **Secrets** — in the host's secret manager / client password manager.
- **Enquiries** — live in the mailbox; follow the mailbox provider's retention/backup policy.
- **Brand masters** — `brand-source/` (request vector SVG/EPS originals from the designer too).

## 6. Rollback

- Tag every release: `git tag v1.0.0 && git push --tags`; build images as `biotonic-web:<tag>`.
- Rollback = redeploy the previous tag/image (most hosts offer one-click "redeploy previous").
- Because the site is stateless, rollback has no data-migration risk.
