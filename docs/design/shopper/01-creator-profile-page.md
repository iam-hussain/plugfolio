# 01 — Creator Profile Page

- **Route:** `plugfolio.com/<username>`
- **Role:** Shopper (public, **no account**)
- **Priority:** P0 — this is the front door of the whole product
- **Entry points:** creator's social bio link (most common, opens in Instagram/TikTok in-app browser), a shared link, a business viewing a creator to reach out

## Purpose

The creator's shoppable home. A visitor instantly understands *who this is* and can start
shopping their content in one tap. First paint must be fast and calm — no popups, no wall.

## Layout (mobile-first, 360px)

```
┌───────────────────────────────┐
│  ← (browser chrome)           │
│  [avatar]  Name                │
│            @username · socials │
│  short bio line               │
│  [ Follow ]        [ Share ]  │   ← Follow = optional account; Share = native sheet
├───────────────────────────────┤
│  Content grid (posts)         │
│  ┌────┐ ┌────┐ ┌────┐         │
│  │post│ │post│ │post│  · 🛍 badge on shoppable posts
│  └────┘ └────┘ └────┘         │
│  ┌────┐ ┌────┐ ┌────┐         │
│  …                            │
└───────────────────────────────┘
```

- **Header:** avatar, display name, `@username`, linked social icons (YouTube/Instagram), a short bio. Compact — content should be visible with minimal scroll.
- **Two actions** under the header: **Follow** (secondary) and **Share** (secondary, native share sheet). Neither blocks browsing.
- **Content grid:** the creator's imported posts as thumbnails. Mark posts that have tagged products with a small **shoppable badge** (e.g. a lime 🛍 dot) so shoppers know where to tap. Reels show a play affordance.
- Tapping any post → **Post View (brief 02)**.

## Content & data

Profile: avatar, name, username, bio, connected social links. Grid: imported posts
(thumbnail, type, shoppable flag). Ordered newest-first (creator can hide posts — hidden
ones don't appear).

## Actions

- **Primary:** tap a post → Post View.
- **Secondary:** Follow (→ triggers shopper account, brief 04), Share (native sheet), tap a social icon (out to the platform).

## States

- **Default:** header + populated grid.
- **Loading:** header skeleton + grid skeleton tiles.
- **Empty:** creator has no visible/shoppable posts yet — show the profile with a gentle "No posts yet" grid placeholder (still not broken-looking).
- **Error:** username not found → friendly 404 that offers Explore-less fallback (e.g. "This page isn't here" + link to plugfolio.com home). Never a stack trace.
- **Edge cases:** brand-new profile still on a **random username**; very long name/bio (truncate); many posts (lazy-load on scroll); a post whose video can't embed (handled in brief 02).

## Components

Avatar, Button (Follow/Share), Badge (shoppable), a responsive grid, Skeleton. Share via Web Share API.

## Theme & accessibility

Dark-first header over `--surface`; one accent moment max (e.g. the shoppable badge or Follow). Grid images need `alt`. Focus order: header actions → grid. Fast LCP: prioritize the avatar + first row of thumbnails.

## Out of scope (v1)

No Explore link, no search bar, no wishlist/save, no ratings, no coupons strip, no "My Creators" — none of those are v1. Keep the page to identity + grid + follow/share.
