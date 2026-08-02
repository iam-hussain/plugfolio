# Watchlist — save a post or a product for later

**Journey served:** "Save is a shelf, not a cart" in [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md) — the third thing behind the optional shopper account, beside follow and comment ([`shopper-account.md`](./shopper-account.md)). Buying never asks for it (§2.2); saving does.

It is a **shelf, not a cart**: nothing here holds a price, reserves stock or settles money (§2.3). Every card routes to that post or product's own page, where the outbound tap and its attribution happen exactly as they would have the first time.

## Data model

`Watch` — `userId` + `kind` (`"post" | "product"`) + `targetId`, `@@unique([userId, kind, targetId])`, `@@index([userId, createdAt])`.

- **Polymorphic, like `Report`, not a pair of nullable FKs** ([ADR-0025](../adr/0025-watchlist-polymorphic-target.md)): Mongo indexes a missing field as null, so a `@@unique([userId, postId])` would collide across every product row and lose the idempotency a double-fired save needs (§6.8). The unique index is what makes `add` and `remove` no-ops on repeat, the same way `Follow`'s does.
- The price is no referential integrity. A deleted post leaves a row; the read drops it (see below), and nothing else in the product joins on it.

## API surface

- `POST /api/watchlist` `{kind, targetId}` → 201 `{watched: true}`
- `DELETE /api/watchlist/:kind/:targetId` → 200 `{watched: false}` (idempotent no-op if it was never saved)
- Both: session required (401 `UnauthorizedError` otherwise); the saver is **always** `session.user.id`, never a body field. A target that doesn't exist — or that a shopper couldn't open anyway (hidden post, suspended page) → 404.
- No read endpoint: `/watchlist` server-renders the list, and the detail pages server-render the saved state.

## Services (`@plugfolio/core`)

`watchTarget` · `unwatchTarget` · `isWatched` · `getWatchlist` (`services/watchlist.ts`), over the `WatchlistRepository` port. `watchTarget` checks the target exists before writing — without a foreign key, a bogus id would otherwise sit in the list forever as a row that renders nothing.

The read (`listByUser`) returns the whole list, newest save first, joined to the post/product and its creator:

- Two queries for the list, not one per row: the saved rows, then the posts and products they point at, re-joined in saved order.
- **Rows whose target has gone — deleted, hidden ([brief 07](./creator-dashboard-tagging.md)), or on a suspended page — fall out of the read.** The list only shows doors that open.
- Unpaged and unsorted beyond newest-first (`ponytail:` in the port). A watchlist is tens of rows; push the slice down if someone saves thousands.

## Surfaces

- **`/watchlist`** (`app/(shopper)/watchlist/page.tsx` → `WatchlistPage`) — signed-in only, `redirect("/signin")` otherwise, inside `ShopperShell` like `/following`. One `ThingsGrid` of `ThingCard`s: image, title, **`by @username`** (the creator who tagged it — half of why it was saved), price and offer flag for products, `Open →` / `Buy →` / `Shop →` for the kind. A `Bookmark` toggle sits in the card's corner, **outside** the card's link — the card is one link, and a button nested in a link is how someone unsaves by accident. Empty state points at `/explore`.
- **`WatchButton`** (feature `shopper-account`) — the Save/Saved pill on the post and product pages, in the byline beside Follow. Same shape as `FollowButton`: anonymous shoppers open the inline `ClaimSheet` (`action="save"`) over the page they're on, never a wall; signed-in shoppers toggle optimistically and revert on failure. `display="icon"` is the corner variant used on the watchlist itself.
- **Chrome** — `Watchlist` in the signed-in top-bar nav, `Saved` (bookmark glyph) as a fifth bottom tab. `watchlist` is in `BASELINE_RESERVED_USERNAMES`, so no profile can shadow the route.

## Edge cases

- Double-fired save/unsave (in-app browsers, §6.8) → absorbed by the unique index; the button is disabled in flight so a save can't race its own removal.
- Saving something that has since been hidden or suspended → 404, not a silent write.
- A saved post is later hidden → it simply leaves the list; nothing tells the shopper, because the creator's visibility choice isn't the shopper's business.
- Signed out on `/watchlist` → `/signin`. The shop path that led there is untouched.

## Tests

- `packages/core/src/services/watchlist.test.ts` — saves/reports/removes, absorbs a double fire and a removal of nothing, refuses a target that isn't there.
- `apps/web/e2e/shopper.spec.ts` — `/watchlist` redirects anonymous visitors to sign-in and `POST /api/watchlist` answers 401.
