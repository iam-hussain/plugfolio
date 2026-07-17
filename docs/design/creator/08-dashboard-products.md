# 08 — Dashboard: Products

- **Route:** `plugfolio.com/dashboard/products`
- **Role:** Creator (**Admin** and **Manager**)
- **Priority:** P1
- **Entry points:** dashboard tab; a "link may be broken" nudge

## Purpose

The creator's product library across the profile — a simple place to see everything they've
tagged, fix a bad link, or remove a product. Keep it a **list you scan**, not a CRM.

## Layout (mobile-first, 360px)

```
┌───────────────────────────────┐
│ [Profile ▾]     Products      │
│ [ search / filter ]           │
│ ┌───────────────────────────┐ │
│ │[img] Name        $price   │ │
│ │ used in 3 posts  ✎  🗑     │ │
│ │ ⚠ link may be broken      │ │  ← flagged state
│ └───────────────────────────┘ │
│  …                            │
└───────────────────────────────┘
```

- A **list** of products: image, name, price, how many posts use it, and edit/remove.
- **Broken/dead-link flag** surfaced inline (Plugfolio checks links) so the creator can fix
  a URL before shoppers hit a 404 — fixing it updates everywhere the product is tagged.

## Content & data

Per product: image, name, price, affiliate URL, count of posts using it, link-health status.

## Actions

- **Primary:** fix a flagged link (edit URL) — propagates to all posts using it.
- **Secondary:** edit product details; remove a product; search/filter.

## States

- **Default:** product list.
- **Loading:** skeleton rows.
- **Empty:** no products yet → "Tag a product on a post to see it here" (→ brief 07).
- **Error:** save/remove failure (retry).
- **Edge cases:** a product used in many posts (show the count; removing warns it affects those posts); a flagged link the creator ignores (stays flagged, non-blocking).

## Components

Table/List, Input (search), Badge (link health), Button, Dialog (confirm remove), Skeleton, Toast.

## Theme & accessibility

The **warning** state is the only place danger/warning color appears — clear but not alarming.
Confirm destructive removes. Full keyboard operability; status conveyed by icon + text.

## Out of scope (v1)

No collections/grouping, no performance analytics per product here (Earnings covers money,
brief 09), no inventory, no bundles — deferred.
