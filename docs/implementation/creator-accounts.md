# Creator accounts — email sign-in and the gated dashboard

**Journey served:** the creator journey's first step in [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md) — "sign up by email; an account is created in one step, nothing connected yet." Identity model per [ADR-0004](../adr/0004-creator-account-profiles-identity.md), storage per [ADR-0007](../adr/0007-authjs-identity-tables.md).

## Data model

Auth.js Prisma-adapter tables (migration `20260718170000_authjs_identity`, hand-written RENAMEs so existing rows survive):

- `Account` → **`User`** (the ADR-0004 "account"): + `emailVerified`, `name`, `image`. `Profile.accountId` → `userId`.
- New `Account` = Auth.js provider links — a Google/Meta row **is** the "connected social" of ADR-0004, and its `access_token`/`refresh_token`/`expires_at` columns are the credentials the social reads use.
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

## Social connections (Google/YouTube — first half of ADR-0004)

- **Connect, not login:** the creator signs in by email+password first, then hits "Connect Google (YouTube)" on the dashboard — a server action calling `signIn("google")`; Auth.js links the resulting `Account` row to the signed-in user.
- Google provider requests `youtube.readonly` with `access_type=offline&prompt=consent` so a refresh token is stored (without it the connection dies in ~1h).
- `listYouTubeChannels` (core service; ports `SocialConnectionRepository` + `YouTubeGateway`) reads the stored token, refreshes it when stale (persisting the fresh one), then lists the account's channels — id, title, `@handle`, thumbnail, subscribers. The `@handle`s are the ADR-0004 username pool for a later username picker.
- Gateway impl lives at the web server seam (`apps/web/src/server/youtube.ts` — refresh needs the env client credentials); token columns read/written by `createSocialConnectionRepository` in `@plugfolio/db`.
- Degraded states surface honestly: env unconfigured → notice; connected but unrefreshable (revoked / pre-consent token) → empty list + Reconnect button, never a crashed dashboard.
- Meta/Instagram follows the same shape (Facebook provider is already env-gated; Graph API gateway + `listInstagramAccounts` pending).

## Edge cases

- User with no profiles: empty state ("connect socials — coming soon"); profile creation requires a social connection (ADR-0004), which isn't built yet.
- The layering rule holds: web never imports Prisma — `createAuthAdapter()` lives in `@plugfolio/db`.

## Verification

- e2e: `/dashboard` unauthenticated → Auth.js sign-in page; existing shopper journeys still pass account-free.
- Migration verified against real Postgres via `migrate deploy` + `prisma migrate diff` (no drift); integration suites run on the renamed schema.
