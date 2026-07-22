# Shopper account — follow and comment

**Journey served:** "the one optional account" in [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md) — a shopper signs in (email, same Auth.js flow as everyone, [ADR-0007](../adr/0007-authjs-identity-tables.md)) **only** to follow a creator or comment on their page. Buying never asks. Follow and comment are the *only* things behind this door in v1 (§2.2).

## Data model

Migration `20260720100000_follows_and_comments`:

- `Follow` — composite PK `(userId, profileId)`; the PK itself makes follows naturally idempotent. Cascade both ways.
- `Comment` — `profileId` (always the owning page) + nullable `productId` (set = a product comment) + nullable `parentId` (set = a reply; one level only, parent must be top-level on the same target — ADR-0013), `userId`, `asProfileId` (ADR-0009), `body`. Post comments deferred. Replies cascade with their parent; product comments with the product.
- A "shopper account" is just a `User` row with no profiles — no separate table, per ADR-0004's one-login model.

## API surface

- `POST /api/follows` `{profileId}` → 201 · `DELETE /api/follows/:profileId` → 200 (idempotent no-op if not following) · `POST /api/comments` `{profileId, productId?, parentId?, asProfileId?, body ≤500}` → 201 (cross-profile product or mismatched parent → 404; reply-to-reply → 400).
- All three: session required (401 `UnauthorizedError` otherwise); the actor is **always** `session.user.id`, never a body field. Unknown profile → 404.
- Reads have no endpoints: the public page server-renders comments (`getComments`, latest 50) and follow state; `/following` renders the followed-creators list — the payoff, with the rich feed still deferred.

## Components (feature `shopper-account`)

- `FollowButton` (client) — signed-out: a door to sign-in; signed-in: toggle backed by `router.refresh()` (server state stays the truth).
- `CommentForm` (client) — signed-in only; 500-char cap mirrors the Zod schema. Carries the ADR-0009 identity picker for profile members (see [member-handles-and-categories.md](./member-handles-and-categories.md)).
- `CommentList` (server) — account-free reading of one-level threads (replies indented, oldest-first); a comment is signed by the author's `@member-handle`, or by the profile + Creator badge when it speaks as one (ADR-0009) — **the author's email is never rendered** (privacy). `ReplyToggle` (client) shows Reply for signed-in viewers and opens an inline `CommentForm` with `parentId`. The product page renders its own thread via `getProductComments`.

## Edge cases

- Double-fired follow (in-app browsers, §6.8) collapses via upsert on the composite PK; unfollow uses `deleteMany` so an already-gone row is a quiet no-op.
- Comment body is trimmed and 1–500 chars at the boundary; empty submissions are disabled client-side and rejected server-side.
- The creator page stays account-free: a session only *enriches* it. `auth()` on the public page costs nothing for anonymous visitors (no session cookie → no DB hit).

## Verification

- Unit: `shopper-social.test.ts` — idempotent follow, unknown-profile 404s, quiet unfollow, comment add/reject.
- e2e: anonymous page shows comments + Follow door with no wall; `POST /api/follows` and `POST /api/comments` return 401 anonymous; all prior shopper journeys unchanged.
