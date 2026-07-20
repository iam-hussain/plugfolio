# Shopper surface — creator page, post view, product page

**Journey served:** the shopper journey in [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md) — arrive on `plugfolio.com/<handle>`, tap a post, see the product, buy. No account on any step (ADR-0002).

## Data model

- **`Post`** — the shoppable unit ("tap a post"). `profileId`, `mediaUrl`, `caption?`. No social import yet, so rows come from seed/dashboard; every row is treated as published — the publish flag lands with the tagging dashboard.
- **`Post ↔ Product`** — implicit many-to-many (`_PostToProduct`): a post tags several products, a product appears in several posts.
- **`Tap.postId`** (nullable) — per-post attribution, the Earnings promise ("this reel drove 312 taps"). `SetNull` on post delete, not Cascade: taps are append-only earnings events (§6.6) and must survive a post's deletion. Indexed on `(postId, occurredAt)` for the read model.
- **`Product.imageUrl` / `priceCents` / `currency`** — display-only metadata grabbed at tag time; the retailer owns the real price. Migration: `20260718150000_posts_and_product_details`.

## API surface

- `POST /api/taps` now accepts optional `postId`. The service (`recordOutboundTap`) verifies via `ProductReadRepository.isTaggedToPost` that the post actually has the product tagged — a forged `postId` gets `NOT_FOUND`, so per-post earnings can't be skewed. Response tap includes `postId`.
- Reads have no HTTP endpoints: public RSC pages call the read services directly (§6.11) — `getCreatorPage`, `getShopperPost`, `getShopperProduct` over the `CreatorPageReadRepository` port (Prisma impl in `@plugfolio/db`). Post/product lookups are scoped by username so one creator's content is a 404 under another's handle.

## Components (feature `creator-page`)

- `PostGrid` — 3-column grid on `/[handle]`, each tile links to the post view. Server-rendered.
- `TaggedProductCard` — product row on `/[handle]/post/[postId]`: image/title/price link to the product page; `ProductTapButton` buys straight from the post (`source: "post"`, carries `postId`).
- Product page `/[handle]/product/[productId]` — photo, price, the post it came from, one Buy (`source: "product"`, carries the source post's id when known).
- Images render `next/image` **unoptimized** until the social-import pipeline pins the real image domains for `remotePatterns`.

## Edge cases

- Unknown handle / post / product → `notFound()` (404 page), never an error screen.
- Post with no tagged products renders the post with an empty-state line — the grid shows untagged posts too.
- Tap recording failing never blocks the buy: the button forwards on `onSettled` either way.
- Double-fired taps collapse per the existing idempotency design (§6.8) — unchanged by this feature.

## Verification

- Unit: `record-outbound-tap.test.ts` — tagged post accepted, forged post rejected, post-less tap records `null`.
- E2E (`shopper.spec.ts`): full journey — grid → post → product card → Buy → tap recorded 201 with `postId` → affiliate redirect. CI's `e2e` job now runs a migrated + seeded Postgres service (this also validates the migration file via `migrate deploy`).
