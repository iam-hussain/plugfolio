# Shopper account — follow and comment

**Journey served:** "the one optional account" in [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md) — a shopper signs in (email, same Auth.js flow as everyone, [ADR-0007](../adr/0007-authjs-identity-tables.md)) **only** to follow a creator or comment on their page. Buying never asks. Follow and comment are the *only* things behind this door in v1 (§2.2).

## Data model

Migration `20260720100000_follows_and_comments`:

- `Follow` — composite PK `(userId, profileId)`; the PK itself makes follows naturally idempotent. Cascade both ways.
- `Comment` — `profileId` (the creator page it's on — page-level in v1, per the lean journey's wording; post-level threads can come later), `userId`, `body`, indexed `(profileId, createdAt)`.
- A "shopper account" is just a `User` row with no profiles — no separate table, per ADR-0004's one-login model.

## API surface

- `POST /api/follows` `{profileId}` → 201 · `DELETE /api/follows/:profileId` → 200 (idempotent no-op if not following) · `POST /api/comments` `{profileId, body ≤500}` → 201.
- All three: session required (401 `UnauthorizedError` otherwise); the actor is **always** `session.user.id`, never a body field. Unknown profile → 404.
- Reads have no endpoints: the public page server-renders comments (`getComments`, latest 50) and follow state; `/following` renders the followed-creators list — the payoff, with the rich feed still deferred.

## Components (feature `shopper-account`)

- `FollowButton` (client) — signed-out: a door to sign-in; signed-in: toggle backed by `router.refresh()` (server state stays the truth).
- `CommentForm` (client) — signed-in only; 500-char cap mirrors the Zod schema.
- `CommentList` (server) — account-free reading; shows `User.name ?? "Shopper"` — **the author's email is never rendered** (privacy; names arrive when profile settings land).

## Edge cases

- Double-fired follow (in-app browsers, §6.8) collapses via upsert on the composite PK; unfollow uses `deleteMany` so an already-gone row is a quiet no-op.
- Comment body is trimmed and 1–500 chars at the boundary; empty submissions are disabled client-side and rejected server-side.
- The creator page stays account-free: a session only *enriches* it. `auth()` on the public page costs nothing for anonymous visitors (no session cookie → no DB hit).

## Verification

- Unit: `shopper-social.test.ts` — idempotent follow, unknown-profile 404s, quiet unfollow, comment add/reject.
- e2e: anonymous page shows comments + Follow door with no wall; `POST /api/follows` and `POST /api/comments` return 401 anonymous; all prior shopper journeys unchanged.
