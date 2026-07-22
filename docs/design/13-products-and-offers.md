# 13 — Products & Offers (affiliate · own · coupon)

- **Surfaces:** the product card everywhere it appears — post view (02), product page (03),
  and the creator's tagging editor (07) + Products tab (08)
- **Role:** Shopper (public) + Creator (dashboard) · **Priority: P0** (the card *is* the buy path)
- **Decisions behind this:** [ADR-0011](../adr/0011-product-kinds-and-coupon-offers.md) ·
  lean journey "Products — three cards, one buy model"

*This brief supersedes the older briefs' assumption that every product is an affiliate
product with a single Buy button. Read with [`00-foundations.md`](./00-foundations.md);
the rules there (mobile-first 360px, no login wall, AA contrast, busy states for
double-tap tolerance) all apply.*

---

## Purpose

One product card, three faces. Every product on Plugfolio is **outbound** — the shopper
always leaves to buy; Plugfolio never shows a cart, checkout, or price total. What varies:

1. **Affiliate product** — someone else's product; Buy goes to the retailer through the
   creator's affiliate link.
2. **The creator's own product** — their product; the button goes to *their* site or store.
3. **Either of the above with a coupon** — a code rides on the product, redeemable
   **online**, **in-store**, or **both**.

The card must make three things instantly clear at a glance: *what it is*, *whose it is*,
and *what I do* (tap out / copy a code / show it at a shop).

---

## The shopper's mental model (design to this)

> "I saw it in the post. Show me the thing, tell me if there's a deal, give me one obvious
> action."

- **Whose product it is** is a quiet label, not a layout change: own products carry a small
  **"Their own product"** tag (this is a trust signal — the creator made/sells this);
  affiliate products stay unmarked (the default, today's look).
- **A coupon changes the card's temperature.** A deal is the single most persuasive
  element on the card — give the code presence (this is a sanctioned accent-color moment),
  but never let it crowd out the primary action.

---

## Card anatomy & variants

Base card (unchanged from briefs 02/03): product photo · title · price (muted, "—" when
unknown) · action area.

### Variant matrix — what the action area shows

| Variant | Label/tag | Actions (in order) |
|---|---|---|
| Affiliate, no coupon | — | **Buy** (today's card, unchanged) |
| Own, no coupon | "Their own product" | **Shop their store** |
| Affiliate + online coupon | code chip | **Copy code** → **Buy** |
| Own + online coupon | tag + code chip | **Copy code** → **Shop their store** |
| Any + in-store-only coupon | code chip + shop line | **Copy code** only — **no Buy button** |
| Any + both channels | tag? + code chip + shop line | **Copy code** → **Buy / Shop their store** |

### The coupon block

- **Code chip:** the code in a monospace-feeling, obviously-copyable chip (e.g. dashed
  border) with a copy affordance. Tapping copies to clipboard and confirms inline
  ("Copied ✓" swap on the chip — not a toast the in-app browser may clip). Copying is
  measured; make the confirmation unmistakable.
- **Expiry line (optional):** "Valid till 3 Aug" — muted; switch to a warmer treatment in
  the final 48h ("Ends tomorrow") if you like, but keep it subtle.
- **In-store line (when present):** shop name + the note the creator wrote ("Show this
  code at the counter — Indiranagar store"). This line is the *entire* redemption path for
  in-store-only offers — it must read as an instruction, not metadata.
- **Order matters:** for coupon cards the intended flow is copy-then-go. Place Copy code
  before the outbound button and let the outbound button's busy state ("Opening…") behave
  exactly as today.

### Expired offers

The product survives its offer. When `offerEndsAt` passes: coupon block collapses to a
single muted line ("Offer ended"), code no longer copyable, card returns to its
no-coupon variant. Never delete or hide the product because its deal ended.

---

## Where the card appears (deltas per existing brief)

**02 — Post view:** stacked product cards gain the variant behavior above. Multiple
products on one post may mix kinds — the visual rhythm must hold with an affiliate card
above an own-product coupon card.

**03 — Product page:** same variants at full width. The in-store line gets room here
(full note + expiry). If the product is in-store-only, this page has **no outbound
button at all** — design that so it doesn't feel broken: the code + instruction *is* the
action.

**07 — Tagging editor (creator):** the tag form grows, but the default path must stay
exactly as fast as today (paste URL → paste affiliate link → Tag):

- A **kind toggle**: "Affiliate product" (default) / "My own product". Own swaps the
  affiliate-link field's label to "Your store/product link".
- A collapsed **"+ Add a coupon"** disclosure → code (required), expiry (optional),
  in-store note (optional), with the rule surfaced gently: *a coupon needs a link, an
  in-store note, or both*. Removing the URL on an own product while a coupon has no
  in-store note is the one validation error to design.

**08 — Products tab (creator):** each row shows its kind tag and, when present, a
compact coupon summary (code · expiry · channel icons) with edit access. "Fix a link"
now also means "fix a code".

**09 — Earnings (creator):** taps stay the headline. Coupon products add a second
number: **code copies**, labeled per channel — online copies count toward the tracked
story; in-store copies are explicitly *"copies — redemption not tracked"*. Never imply
Plugfolio saw an in-store sale. (The *tracked vs estimated* label is a product promise.)

---

## States to design

- All six card variants (table above) — light & dark, 360px first.
- Code chip: idle / tapped-copied ("Copied ✓") / expired.
- Expiry: none / future ("Valid till…") / last-48h / ended.
- In-store-only product page (no outbound button — must not look broken).
- Tag form: affiliate default / own selected / coupon disclosure open / the
  no-channel validation error.
- Products-tab row: kind tag + coupon summary; editing a coupon.
- Long codes, long shop notes: truncate the note, never the code (the code must always be
  fully visible — a truncated code is useless).

## Components

Existing Card, Button (Buy/Shop = accent variant, unchanged), Badge (kind tag). New:
the **code chip** (copy interaction — this is the one genuinely new primitive; flag if
you want it as a shared component), a disclosure for "+ Add a coupon", and channel
icons (online / in-store) if you find them clearer than words.

## Theme & accessibility

- The code chip is a legitimate **accent** moment (Electric Lime family) — but AA
  contrast rules from foundations apply; lime-on-light fails easily, test both themes.
- Copy must work without hover (in-app browsers): tap target ≥44px, visible confirmation.
- The copy action needs an accessible name ("Copy code MAYA15") and the confirmation
  must be announced (aria-live) — clipboard feedback can't be color-only.
- Expired state must not rely on color alone — the "Offer ended" text carries it.

## Out of scope — do not design

Checkout, cart, price totals, or payment of any kind (Phase B, doc-gated) · coupon
auto-apply / affiliate-link code injection · tracked in-store redemption or QR scanning ·
bundles, drops, availability windows · bounty/fixed-action offers · stacking multiple
coupons on one product (one offer per product in v1).
