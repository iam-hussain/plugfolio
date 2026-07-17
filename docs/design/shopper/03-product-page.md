# 03 — Product Page

- **Route:** `plugfolio.com/<username>/product/<productId>` (shareable)
- **Role:** Shopper (public, **no account**)
- **Priority:** P0 — the last step before the sale
- **Entry points:** a tagged product in Post View (brief 02); a shared product link

## Purpose

Give the shopper what they need to buy: the product, its price, **which post it came from**,
and one clear **Buy** button that leaves to the retailer (tracked, so the creator gets credit).

## Layout (mobile-first, 360px)

```
┌───────────────────────────────┐
│ ←                      [Share]│
│      [ product image ]        │
│      (gallery if multiple)    │
├───────────────────────────────┤
│  Product name                 │
│  $price                       │
│  by <creator> · from “post”→  │  ← link back to Post View (source post)
│                               │
│  short description (optional) │
│                               │
├───────────────────────────────┤
│        [   Buy   ]            │  ← sticky at bottom; goes to retailer
│  Opens the retailer’s site    │
└───────────────────────────────┘
```

- **Image(s)** first. **Name + price** prominent. A line crediting the creator and a link
  back to the **source post** (reinforces "she actually used this").
- **Buy** is a **sticky bottom CTA** — the highest-emphasis action on the page (the one lime moment is a candidate here). Tapping it records the outbound tap and sends the shopper to the retailer.
- Small, honest helper under Buy: "Opens the retailer's website."

## Content & data

Product image(s), name, price, optional description, creator attribution, source-post link,
affiliate destination URL. No stock/inventory promises in v1.

## Actions

- **Primary:** **Buy** → tracked redirect to retailer (append affiliate link; fire outbound-tap event, idempotent).
- **Secondary:** Share (native sheet); back to source post; tap creator → their profile.
- **Comment** (optional): a comment/question affordance that, when used, triggers the shopper account (brief 04). Buying never does.

## States

- **Default:** full product with Buy enabled.
- **Loading:** image + text skeletons; Buy disabled until the link resolves.
- **Empty:** n/a (a product always has at least name + link).
- **Error:** product not found → friendly message + link back to the creator's page.
- **Edge cases:**
  - **Dead / broken affiliate link** (Plugfolio flags these): show Buy as unavailable with "This link isn't working right now" rather than sending the shopper to a 404.
  - Missing price → hide the price line rather than showing "$0".
  - Long name/description → truncate with expand.

## Components

Image gallery/Carousel, Button (sticky Buy), Badge, Skeleton, Toast (e.g. "Coupon copied" is deferred — not v1). Share via Web Share API.

## Theme & accessibility

Buy is unmistakable — full-width, high contrast, thumb-reachable, sticky. If lime is used
for Buy, use dark text on lime (AA). Image needs `alt`. Announce redirect intent to screen
readers ("opens retailer site in a new tab").

## Out of scope (v1)

No guest checkout on Plugfolio, no coupon copy, no star ratings, no "actually uses this"
badge, no price-drop alerts, no wishlist/save, no share-to-earn reward. Just: see it, Buy it.
