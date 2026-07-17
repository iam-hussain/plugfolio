# 07 — Dashboard: Posts & Tagging Editor

- **Route:** `plugfolio.com/dashboard/posts` (+ the tagging editor per post)
- **Role:** Creator (**Admin** and **Manager** — both can post/tag)
- **Priority:** P0 — the core creator tool; the whole product depends on this being easy
- **Entry points:** dashboard home; the "6 posts have no products tagged" nudge; profile switcher

## Purpose

Show every imported post and let the creator **tag a product onto a post in under two
minutes**. This is where content becomes shoppable — the aha the whole app sells.

## Layout (mobile-first, 360px)

**Posts list**
```
┌───────────────────────────────┐
│ [Profile ▾]      Posts        │  ← profile switcher (if >1 profile)
│ Filter: [All] [Tagged] [Untag]│
│ ┌────┐ ┌────┐ ┌────┐          │
│ │post│ │post│ │post│  🛍/○     │  ← 🛍 = has product, ○ = untagged
│ └────┘ └────┘ └────┘          │
│  …                            │
└───────────────────────────────┘
```

**Tagging editor (open a post)**
```
┌───────────────────────────────┐
│ ←  Tag products               │
│      [ post media ]           │
│                               │
│  Add a product:               │
│  [ paste product URL … ]  [+] │  ← auto-fetches image/title/price
│  ┌───────────────────────────┐│
│  │[img] Name  $price  ✎  🗑  ││  ← tagged product row
│  └───────────────────────────┘│
│  Affiliate link: [ ______ ]   │
│  [ Preview as visitor ] [Publish]│
└───────────────────────────────┘
```

- **Posts list:** thumbnails with a **tagged / untagged** indicator; filter by state; a re-sync affordance.
- **Tagging editor:** the post media + an **"add a product"** field where the creator
  **pastes any product URL** and Plugfolio fetches image/title/price. Attach the **affiliate
  link**. Preview as a visitor. **Publish** makes it live on the public post view.

## Content & data

Imported posts (thumbnail, type, tagged state, hidden state); per post: tagged products
(image, name, price, affiliate URL). Import runs automatically and keeps syncing.

## Actions

- **Primary:** paste URL → add product → attach affiliate link → **Publish**.
- **Secondary:** edit/remove a tagged product; hide a post from the public page; re-sync; preview as visitor; switch profile.

## States

- **Default:** populated posts; editor with tagged products.
- **Loading:** import/sync running (posts stream in); URL fetch in progress.
- **Empty:** no posts imported yet → "Your posts are importing…" or "Connect a social to import" (→ brief 05).
- **Error:** URL fetch failed (let the creator enter title/price/image manually — syncing/tagging never blocks); publish failure (retry).
- **Edge cases:** post media won't embed (thumbnail fallback, same as brief 02); product with no affiliate link (allowed — Buy just links to the URL); Manager editing (can tag/post but **cannot** reach profile settings/connections).

## Components

Grid, Tabs/Filter, Input (URL), Card (product row), Button, Dialog/Sheet (editor), Skeleton, Toast, DropdownMenu (profile switcher).

## Theme & accessibility

The editor is a focused workspace — reduce chrome. Publish is the one strong action. The
URL-paste field should feel magical and forgiving (accept messy input). Full keyboard path;
announce fetch results and publish success.

## Out of scope (v1)

No AI product suggestions, no bulk-tag across posts, no "shop the look" bundles, no
availability windows/drops, no coupon fields — all deferred.
