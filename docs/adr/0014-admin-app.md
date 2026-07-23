# ADR-0014 — Internal admin app: direct DB access, separate admin identity

## Context

Operating Plugfolio needs an internal surface: moderating members and content,
suspending abusive accounts, reserving usernames that would shadow product
routes (`/dashboard`, `/explore`, …), and flipping runtime settings without a
deploy. None of this belongs in the public product or its API: admin verbs are
low-traffic, trusted-operator-only, and must never widen the public attack
surface. Two decisions had to be made: how the admin app reaches data, and who
an admin *is*.

## Decision

1. **`apps/admin` is a third Next.js deployable that talks to the database
   directly** through `@plugfolio/core` services and `@plugfolio/db`
   repositories — the same seam `apps/web` uses for its server-rendered reads
   (ADR-0006: RSC skips HTTP). No admin endpoints are added to `apps/api`;
   mutations are Next.js Server Actions calling one core service each. The §6
   layering is unchanged: http/action → service → repository.
2. **Admin identity is a separate `AdminUser` table**, never the product
   `User` table and never a role flag on it — a product-auth bug must not
   escalate to admin access. Sign-in is email + password (same scrypt helper
   as ADR-0012) via Auth.js with **stateless JWT sessions** (nothing else
   validates admin sessions, so no Session rows) under an app-specific cookie
   name. There is no admin sign-up or reset: operators are seeded/rotated with
   `pnpm --filter @plugfolio/admin create-admin`.
3. **Every admin mutation is audited** in an append-only `AdminAction` table
   (who, verb, target, when) — same discipline as `Tap`.
4. **Runtime app settings live in a JSON `AppSetting` key-value table**,
   edited only by the admin app and read by product code through core services
   (`isUsernameReserved`, `isFeatureEnabled`), each key Zod-validated with a
   safe fallback.

## Consequences

- Admin ships features at service speed: a new admin verb is a core service +
  repository method + one server action — no API versioning, no client SDK.
- The admin deployable needs `DATABASE_URL` (it is a DB client like
  `apps/api`), so it deploys where the database is reachable and stays off the
  public domain; `robots` is noindex and nothing links to it.
- Product enforcement points read the new columns: login rejects
  `User.suspendedAt` (reason `suspended`), public creator-page/explore reads
  filter suspended profiles and profiles of suspended accounts, and member
  handles (later profile usernames) check the reserved list.
- Admin has no permission tiers in v1 — every operator is a superadmin; roles
  layer on when a second kind of operator exists.

## Status

Accepted — July 2026.
