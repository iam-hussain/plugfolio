# 02 — Post View (tagged product)

- **Surface:** opens over the creator profile — a **bottom sheet / full-screen overlay** on mobile (route can be `plugfolio.com/<username>/p/<postId>` for shareability)
- **Role:** Shopper (public, **no account**)
- **Priority:** P0 — this is the **signature interaction**: content becomes a shop window
- **Entry points:** tapping any post on the Creator Profile Page (brief 01); a shared post link

## Purpose

Show a single post big, and reveal **the product tagged in it** right there — "here's
exactly what's in this video." One tap from seeing to shopping.

## Layout (mobile-first, 360px)

```
┌───────────────────────────────┐
│ ✕                             │
│                               │
│      [ post media ]           │   ← reel plays / photo fills
│      (video or image)         │
│                               │
├───────────────────────────────┤
│  🛍 In this post              │
│  ┌───────────────────────────┐│
│  │ [img] Product name        ││  ← tap → Product Page (brief 03)
│  │       $price   [ View ]   ││
│  └───────────────────────────┘│
│  ( more tagged products… )    │
└───────────────────────────────┘
```

- **Media** dominates the top. Video autoplays muted where allowed; photo fills.
- Below (or overlaid): a **"In this post"** list of tagged product(s) — thumbnail, name, price, and a tap target to the Product Page. In v1 a post usually has one product; support a short list.
- **Close** returns to the grid without a full reload.

## Content & data

The post media (or a safe fallback), and its tagged products (image, name, price, link to
product page). Attribution: opening/here is where an **outbound-tap event** originates once
the shopper taps through.

## Actions

- **Primary:** tap a tagged product → Product Page.
- **Secondary:** Share this post (native sheet), close.

## States

- **Default:** media + product list.
- **Loading:** media skeleton + product-row skeleton.
- **Empty:** post has no tagged product (shouldn't be reachable from a shoppable badge, but if so: show the media with a quiet "No products tagged" note — never look broken).
- **Error:** post unavailable → close gracefully back to profile.
- **Edge cases (important):**
  - **Video won't embed** (common in in-app browsers, esp. Instagram): show a **thumbnail + "Watch on Instagram/YouTube" tap-out** instead of a broken player. Never a blank box.
  - Multiple tagged products: scrollable list.
  - Slow network: show product rows as soon as they load, even before media.

## Components

Sheet/Dialog (full-screen on mobile), video/image with fallback, product row (Card), Button, Skeleton. Share via Web Share API.

## Theme & accessibility

Media-forward, dark surround. Product rows on `--surface-raised`. The "View" affordance may
carry the one lime accent. Controls (close, product taps) keyboard-reachable and labeled;
autoplay respects `prefers-reduced-motion` (no autoplay when reduced).

## Out of scope (v1)

No comments UI here (comments live on the profile/product context, brief 04), no ratings, no "actually uses this" badge, no share-to-earn reward framing.
