# ADR-0011 — Product kinds (affiliate | own) & coupon offers, outbound-only

**Status:** Accepted (2026-07-22)

## Context

v1 shipped exactly one product type: an affiliate product whose Buy button taps out to a
retailer. A July 2026 market survey (LTK, ShopMy, Mavely, Linktree, Stan Store,
Fourthwall, Amazon/TikTok/Instagram native programs) showed: outbound affiliate is the
everyday creator engine; personal **discount codes** are a second attribution channel
that survives the link being lost (ShopMy attributes 100% of code orders); creators also
promote **their own** products/stores; pure-affiliate-only platforms are dying
(Collective Voice shut down); and on-platform checkout (Stan, Fourthwall) is a
merchant-of-record business — payments, refunds, tax — not a product flag.

Golden rules stand: no login on any shop path, and **v1 handles no money** (§2.3).

## Decision

1. **`Product.kind = affiliate | own`.** Same outbound card, same tap event. Kind changes
   presentation and earnings language only: `affiliate` implies a network commission paid
   directly to the creator; `own` is the creator's own product linking to their own
   site/store — traffic measured, no commission implied.
2. **A coupon is an optional attachment on any product, not a third kind.** Fields:
   `couponCode`, optional `offerEndsAt`, optional `inStoreNote` (shop name / "show at the
   counter"). Redemption channels derive from what's present:
   - **online** — the product has a destination URL: copy code → tap out;
   - **in-store** — `inStoreNote` is set: show the code at the shop, no link needed;
   - **both** — URL and note both present.
   A coupon must have at least one channel. An in-store-only offer is a product with a
   code and a note but **no URL — and therefore no Buy button**.
3. **Attribution stays append-only and honest.** Outbound taps are unchanged. A new
   `code_copied` event (same append-only discipline as taps) counts copies. In-store
   redemption happens beyond Plugfolio's sight — Earnings shows code copies and labels
   the channel **untracked**, per the existing *tracked vs estimated* rule.
4. **Expired offers render as ended, never deleted** — the code and its copy history are
   attribution data.
5. **Phase B is named, not built:** on-platform checkout for creator-owned goods (digital
   downloads first, then merch/memberships) is the deliberate money-handling step — its
   own ADR covering payments, the first exception to no-login shopping, and the fee
   model. It stays in the lean journey's deferred table until that doc change.

## Consequences

- Schema cost is one enum + three nullable columns on `Product`; no payment
  infrastructure, no new buy model — "outbound only" stays true.
- The product card gains variants (Buy / Shop their store / Copy code / show-at-counter,
  expired state) — designer brief: [`docs/design/13-products-and-offers.md`](../design/13-products-and-offers.md).
- Coupons strengthen the collab loop: a business granting a creator a personal code is a
  concrete deliverable inside the existing thread — no new surface.
- Tag form grows: kind toggle + optional coupon fields. Defaults keep the current flow
  unchanged (affiliate, no coupon) so tagging stays fast.

## Revisit if

- Creators demand **tracked** in-store redemption → card-linked offers (bank/card
  integrations) — a separate, heavy decision.
- Brands want bounty-style fixed-action offers (Amazon model) → needs per-action
  contracts; not before business density.
- Phase B (checkout) is pulled in → new ADR; this one's "outbound only" line is amended.
