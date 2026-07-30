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

## Components

Shared visual components live in **`@plugfolio/ui`** ([ADR-0018](../adr/0018-design-system-in-ui-package.md)) — they know shapes, never sources. `apps/web/src/features/creator-page` keeps the data-fetching and interactive wrappers.

From the creator page (DESIGN `creator.html`), now in the design system: `CreatorHeader` (three treatments), `SocialsRow`/`SocialGlyph`, `ShareWays`/`ShareWay`, `ShelfChips`/`ShelfChip`/`ShelfDescription`, `PageBand`/`PageBandText`, `EmptyState`, and the comment set — `CommentSection`, `CommentSort`/`SortButton`, `CommentList`, `Comment`, `CommentThread`, `CommentAvatar`. Stories: `Creator page/Header` and `Creator page/Parts`.

The design's named scale now lives in the Tailwind preset rather than as literals: `text-micro|label|copy|body|title|name|name-lg`, `rounded-nest`, `max-w-inner`, `ease-design`.

### Feature components (`creator-page`)

- `PostGrid` — the Shop wall on `/[handle]`: 2-up on a phone, 3-up from 640px, 4-up from 1000px. One grid, two kinds of tile — a **post** (photo + white product-count chip) and a **product** the creator shelves directly (photo + ink price chip). A product tile also carries its commercial flags: `Their own` (ADR-0011 kind, stacks with a code), `Code X` (live coupon, lime), `In-store code` (no link to open — the code *is* the action), `Offer ended` (goes quiet; the product stays). No price chip when the price is unknown — never a zero. Server-rendered; the flag matrix lives in Storybook (`Creator page/Shop grid`) because it never all shows up in seed data.
- **Page appearance (ADR-0017).** `CreatorHeader` takes a `style` (`compact` · `balanced` · `centred`) and an optional `greeting`; `PostGrid` takes a `layout` (`grid` · `cards` · `list`). The accent is one `data-accent` attribute on `<main>` — the `[data-accent="…"]` blocks in `@plugfolio/tokens` move `--color-primary` and nothing else, so every component keeps reading the token and none of them knows a creator picked coral. Controls live in `/dashboard/settings` ("How it looks"), Admin-only; the page's Customise button links there. Layouts are in Storybook under `Creator page/Shop grid`.
- **Post view (DESIGN `post.html`)** — `BackLink` → `CreatorByline` (identity, not a profile) → the owner's tap band → `MediaSlot` + `PostCaption` → `DetailSectionHeading` → `ProductList` of `ProductCard`s.
  - **`MediaSlot` loads video as a facade** ([ADR-0019](../adr/0019-video-posts-load-as-a-facade.md)): poster, play control, provider name, and the iframe only on press. Verified in the browser — zero requests to the provider before the press, one iframe after. Aspect is the provider's (16:9 YouTube, 9:16 capped at 420px and centred for reels), and the tap-out link is always under the frame for the in-app browsers that refuse to play embeds. `Post.mediaKind`/`embedUrl`/`sourceUrl`; unset kind reads as a still, so no existing row needed touching.
  - **`ProductCard` is not a link.** It holds two competing actions — copy a code, leave for the retailer — and nesting them in one link is how a shopper copies a code by accident. The title is the link; the button is the button. The list doesn't `align-items: start`, so a coupon card and a bare one stretch to the same height and the Buy buttons line up across the row.
  - `CouponBlock` is **always above the action**: copy, then go. An ended offer goes quiet and the product survives it.
- **Product view (DESIGN `product.html`)** — `ProductDetail` (46% media from 860px) → `ProductMedia` → `OwnBadge` → `ProductTitle` → `ProductPrice` → `ProductWhere` → coupon → action → `OffPlatformNote` → `ProductSource`.
  - The price is the largest thing after the title — it's the number the screen exists to hand over — and it's **absent when unknown, never "$0"**; the channel line carries on, so the block never collapses.
  - **A product with no image is not broken**: plenty of retailers give none, so `ProductMedia` renders a deliberate placeholder rather than a gap.
  - In-store-only has **no Buy button** — there is no link to open. `ProductInStoreNote` says the code is the action, so the screen can't read as broken.
  - `ProductGone` is the removed-product page: not a generic 404, because the shopper arrived from a real post or a shared link, so it says what happened and hands them back to the creator.
- **Share row** — the native share sheet (`ShareButton`) beside `QrButton`, which encodes the page URL for real via `@/lib/qr` (ported from the design's `qr.js`; `qr.test.ts` decodes every symbol back out, checks both format copies agree and the Reed-Solomon syndromes are zero). A code that doesn't scan would fail in exactly the moment it exists for — someone holding a phone up at a stall.
- **Comments** — composer first, then `Recent · Oldest · Most helpful` chips (URL-driven, `?sort=`), the threads, then `Load more comments` (`?cpage=`). Each comment carries helpful / not helpful counts; reading them is account-free, reacting needs the account follow and comment need. Sorting by "most helpful" is a count over a relation Mongo won't order by, so the repository pulls top-level ids, sorts, and hydrates only the page — `ponytail:` marked.
- The Shop header counts three things — `N posts · N products · N things tagged` — where "things tagged" is tag instances inside posts (the standalone products are already counted on their own).
- `CreatorByline` — the compact identity row on the post and product views (DESIGN post.html §.pc): back link, avatar, name, and one action (Follow for visitors, Edit tags for the owner). These pages deliberately do **not** wear `CreatorHeader` — the full header makes a detail page read as a second landing page and pushes what the visitor came for below the fold.
- The post view also carries an **owner-only taps band** ("N taps tracked from this post"), because taps are the reason tagging exists and that's where the creator is looking. Visitors never see it.
- Every buy control is `Button variant="action"` — the page accent as a fill under white, arriving at Ink on hover, so it follows the creator's chosen accent. **Not `accent`**, which is Electric Lime: lime means a real offer (§7), and every Buy button being lime said "offer" on products that had none. Lime now appears only on the coupon chip.
- Each tagged card states where the money goes — "Payment settles off-platform · opens the retailer / their store / show the code in store" (§2.3, said at the tap).
- `TaggedProductCard` — product row on `/[handle]/post/[postId]`: image/title/price link to the product page; `ProductTapButton` buys straight from the post (`source: "post"`, carries `postId`).
- Product page `/[handle]/product/[productId]` — photo, price, the post it came from, one Buy (`source: "product"`, carries the source post's id when known).
- Images render `next/image` **unoptimized** until the social-import pipeline pins the real image domains for `remotePatterns`.

## One page, four viewers (design-out)

The creator page adapts only its chrome to the session — the buy path never changes: anonymous (outline Follow → sign-in) · signed-in shopper (working Follow + comment composer) · business viewer (the "You own a business" Request-collab strip) · **owner** (Admin or Manager): Share (native share sheet, clipboard fallback) + Edit profile (Admin only) replace Follow, plus a "This is your page — visitors see exactly this" band with a Dashboard link (and an add-your-links nudge when the socials row is empty). The business strip is suppressed on your own page. Inline layout/featured editing from the prototype stays deferred (no layout model).

## Edge cases

- Unknown handle / post / product → `notFound()` (404 page), never an error screen.
- Post with no tagged products renders the post with an empty-state line — the grid shows untagged posts too.
- Tap recording failing never blocks the buy: the button forwards on `onSettled` either way.
- Double-fired taps collapse per the existing idempotency design (§6.8) — unchanged by this feature.

## Verification

- Unit: `record-outbound-tap.test.ts` — tagged post accepted, forged post rejected, post-less tap records `null`.
- E2E (`shopper.spec.ts`): full journey — grid → post → product card → Buy → tap recorded 201 with `postId` → affiliate redirect. CI's `e2e` job now runs a migrated + seeded Postgres service (this also validates the migration file via `migrate deploy`).
