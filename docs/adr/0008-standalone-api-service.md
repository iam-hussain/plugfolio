# ADR-0008 — Standalone API service (`apps/api`) behind a same-origin proxy

## Context

ADR-0005 committed to one deployable (`apps/web`) with the REST API served by Next.js route handlers, and ADR-0006 committed to REST as the contract for client islands and a future native app. The team decided to split the API out now, ahead of the mobile app, so the API can be scaled, deployed, and hosted independently of the web frontend. The layering rules (§6: thin controllers, logic in `@plugfolio/core`, Prisma only in `@plugfolio/db`) were designed to make exactly this extraction cheap.

## Decision

- **`apps/api`** is a second deployable: a **Hono** server on Node exposing the same versioned REST paths under `/api/*` (taps, follows, comments, businesses, requirements, collabs, health). Routes remain thin shells over the same `@plugfolio/core` services and `@plugfolio/db` repositories; no business logic moved or was rewritten.
- **The web app proxies `/api/*` to the API** via a Next.js rewrite (`API_URL`, default `http://localhost:3001`). Browsers keep calling one origin, so session and device cookies work unchanged and no CORS is needed. Filesystem routes win over rewrites, so **Auth.js (`/api/auth/*`) stays in `apps/web`** — sign-in owns the web origin's cookies. Future mobile clients call the API host directly (token transport for mobile is a separate, later decision).
- **Session verification without Auth.js on the API**: sessions are database rows (ADR-0007), so the API resolves the `authjs.session-token` cookie against the `Session` table (`createSessionRepository` in `@plugfolio/db`).
- **Shared identity code moved to core**: the signed device-token helpers (§6.7, ADR-0002) now live in `@plugfolio/core/auth/device-token` with the secret as a parameter, so both deployables verify the same tokens; `DEVICE_TOKEN_SECRET` must match across both.
- Public RSC pages in `apps/web` continue to call services directly — no HTTP hop was introduced for server-rendered reads (§6.11 unchanged).
- The API runs via `tsx` — no build step. The deploy target (below) is a plain Node host, not a bundler-constrained platform, so `tsx` costs about a second of boot and nothing else; a build pipeline earns its place only if boot time or memory becomes a problem.

## Deployment (added 2026-08-01)

Non-prod `apps/api` runs on a **single Amazon Lightsail instance, Ubuntu 24.04 "OS Only"** — not a Bitnami blueprint, which ships its own Node/Apache layout to undo. `apps/web` and `apps/admin` stay on Vercel; only the API left.

- **Process**: systemd unit `plugfolio-api.service`, `ExecStart` the workspace's own `node_modules/.bin/tsx`, `Restart=always`.
- **TLS**: Caddy reverse-proxies `127.0.0.1:3001` and obtains its own certificate. Port 3001 is never exposed; 80 stays open for ACME.
- **Config**: `/etc/plugfolio-api.env` (root, 600) read via `EnvironmentFile`. A repo `.env` is ignored — the `start` script has no `--env-file`, unlike `dev`.
- **Install**: `pnpm install --filter @plugfolio/api...` limits the box to core/db/config; `next` and the design system never land on it.
- **Deploy**: the CI `deploy-api` job SSHes in on every push to `main` whose `verify` job passes — pull, install, `db:generate`, `systemctl restart`, then assert `/api/health`. Gated on `verify` rather than the whole workflow so unrelated job failures can't block a release.

`API_URL` on the web project points at this host. It is read by `rewrites()` at **build** time and baked into `routes-manifest.json`, so changing it requires a redeploy, not just a redeploy of config.

## Consequences

- Independent scaling/deploy for the API; the mobile app gets a dedicated host with no web coupling.
- Two deployables to run: local dev and e2e boot both (`pnpm dev` per app; Playwright starts both servers). Env is duplicated where shared (`DATABASE_URL`, `DEVICE_TOKEN_SECRET`).
- Production needs the proxy configured (`API_URL`) and, if the API is on a subdomain for mobile, matching cookie-domain decisions when mobile auth lands.
- The web app's own `/api/*` route handlers are gone (except Auth.js); its composition root keeps only the repositories its server-rendered pages read.

## Status

Accepted (2026-07-20). Amends ADR-0005 (now two deployables) and ADR-0006 (same REST contract, now served by a dedicated service). Deployment section added 2026-08-01 when the target was chosen; amends ADR-0001's "Hosting: Vercel", which now covers the web apps only.
