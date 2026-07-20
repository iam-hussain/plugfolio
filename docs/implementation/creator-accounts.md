# Creator accounts — email sign-in and the gated dashboard

**Journey served:** the creator journey's first step in [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md) — "sign up by email; an account is created in one step, nothing connected yet." Identity model per [ADR-0004](../adr/0004-creator-account-profiles-identity.md), storage per [ADR-0007](../adr/0007-authjs-identity-tables.md).

## Data model

Auth.js Prisma-adapter tables (migration `20260718170000_authjs_identity`, hand-written RENAMEs so existing rows survive):

- `Account` → **`User`** (the ADR-0004 "account"): + `emailVerified`, `name`, `image`. `Profile.accountId` → `userId`.
- New `Account` = Auth.js provider links — a future Google/Meta row **is** the "connected social" of ADR-0004.
- `Session` (database sessions), `VerificationToken` (magic links).

## Auth surface

- `POST/GET /api/auth/*` — Auth.js handlers; email magic-link provider; the default Auth.js sign-in page for now (the branded page of design brief 04 replaces it later).
- **No mail transport yet**: `sendVerificationRequest` logs the link to the server console; dev signs in by pasting it. A real provider (SMTP/Resend) plugs into that one function at deployment.
- `auth()` exposes `session.user.id` (session callback) so server components can scope reads.
- New env: `AUTH_SECRET` (required, ≥32 chars), `EMAIL_FROM` (defaulted). Declared in `turbo.json` build env + CI placeholders.

## Dashboard v0 (`/dashboard`)

- Server component; `auth()` → no session → `redirect("/api/auth/signin")`. **Never a shop wall** — every shopper path stays account-free (§2.2); e2e asserts the gate exists AND the shop paths stay open.
- Reads via `getMyProfiles(userId)` (new `ProfileReadRepository` port) then `getEarnings(profileId)` for the first profile — earnings scoping comes from the session-derived profile list, never from client input.
- Renders the `earnings` feature's `EarningsSummaryView` (total taps · by post · by product, labeled tracked). Posts/Products/Collabs tabs and the profile switcher land with tagging, social connects, and multi-profile creation.

## Edge cases

- User with no profiles: empty state ("connect socials — coming soon"); profile creation requires a social connection (ADR-0004), which isn't built yet.
- The layering rule holds: web never imports Prisma — `createAuthAdapter()` lives in `@plugfolio/db`.

## Verification

- e2e: `/dashboard` unauthenticated → Auth.js sign-in page; existing shopper journeys still pass account-free.
- Migration verified against real Postgres via `migrate deploy` + `prisma migrate diff` (no drift); integration suites run on the renamed schema.
