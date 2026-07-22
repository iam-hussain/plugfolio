# Product kinds & coupon offers (affiliate · own · coupon)

**Journey served:** the lean journey's "Products — three cards, one buy model". Decision:
[ADR-0011](../adr/0011-product-kinds-and-coupon-offers.md). Designer brief:
[13-products-and-offers.md](../design/13-products-and-offers.md).

## Data model

Migration `20260722090000_product_kinds_and_coupons`:

- `Product.kind` — `ProductKind` enum (`affiliate` | `own`), default `affiliate`.
- `Product.affiliateUrl` — now **nullable**: the outbound destination (retailer link or
  the creator's own store). Null = in-store-only coupon → no Buy button, and the tap
  service rejects taps on it (a tap with no destination is a forged event).
- `Product.couponCode` / `offerEndsAt` / `inStoreNote` — the coupon attachment. Channel
  rule (a link, or a coupon with an in-store note) enforced at the Zod boundary on tag
  and in the service on coupon edit.
- `CodeCopy` — the second attribution event, append-only exactly like `Tap`:
  `(productId, profileId, postId?, deviceId, idempotencyKey unique, occurredAt)`.
  Insert race on the key returns the winner (§6.8).

## Services (`@plugfolio/core`)

- `tagProductToPost` — passes kind + coupon through; boundary schema
  (`tagProductInput`) owns the channel rule and the "expiry/note need a code" rule.
- `setProductCoupon` — "fix a code": `couponCode: null` clears everything; setting a code
  revalidates the channel against the product's actual URL (VALIDATION AppError if none).
- `recordCodeCopy` — mirrors `recordOutboundTap`: profile derived from the product, post
  membership verified, idempotent; additionally rejects copies on code-less products.
- `recordOutboundTap` — new guard: 404 on a product with no outbound destination.
- Earnings: `EarningsSummary` gains `totalCodeCopies` and per-product `codeCopies`;
  products with copies but no taps (in-store-only) still get a row.

## API surface

- `POST /api/code-copies` `{productId, postId?, idempotencyKey}` — anonymous, device
  cookie identity, same shape as `/taps`.
- `PATCH /api/products/:productId/coupon` `{couponCode|null, offerEndsAt?, inStoreNote?}`.
- `POST /api/posts/:postId/products` (tag) accepts `kind`, optional `affiliateUrl`, and
  the coupon fields.

## Components

- `CouponBlock` (server) + `CopyCodeButton` (client, `creator-page`) — code chip →
  clipboard → inline "Copied ✓" (aria-live); the copy event never blocks the copy.
  Expired offers collapse to "Offer ended".
- `TaggedProductCard` / product page — kind tag ("Their own product"), button label by
  kind (Buy / Shop their store), button hidden when no URL, coupon block underneath.
- `TagProductForm` — kind radios + `<details>` "+ Add a coupon" (code, date, note);
  default affiliate path unchanged. Submit gated on the channel rule client-side.
- `ProductRow` — kind tag, coupon editor (empty code = remove), link editor unchanged.
- `EarningsSummaryView` — "code copies · redemption not tracked" stat + per-product
  "· N copies".

## Edge cases

- In-store-only product: no tap possible (service 404s forged ones), page renders code +
  note as the entire action.
- Clipboard denial in odd in-app browsers: copy fails silently — the code is still
  visible to read; the card never errors.
- Coupon expiry is render-time (`Date.now()` on the server) — no cron needed; the code
  stays in the DB as attribution history.
- Legacy rows: migration defaults every existing product to `kind=affiliate`, URL intact.

## Verification

- Unit (48 core tests): tap rejected on destination-less product; code copy idempotent +
  rejected on code-less product; schema channel-rule cases; setProductCoupon set / clear /
  no-channel VALIDATION.
- No live DB here: `prisma validate` + generate pass; run `migrate deploy` + seed (adds
  an own-product with a both-channel coupon: "Lena's Desk Mat" / `LENA15`) on the first
  credentialed environment.
