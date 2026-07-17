# 11 — Business: Post a Requirement & Find Creators

- **Routes:** `plugfolio.com/business/requirements` (post + list), creator browsing reuses the public creator page (brief 01)
- **Role:** Business
- **Priority:** P1
- **Entry points:** business dashboard after sign-up (brief 04); "Post a requirement"; browsing a creator's page and tapping "Work with me"

## Purpose

Give a business the **two doors** to meet a creator: **post a requirement** (creators come to
them) or **reach out to a creator directly** (they go to the creator). Keep it one focused
surface — no campaign suite.

## Layout (mobile-first, 360px)

**Post a requirement (brief form)**
```
┌───────────────────────────────┐
│  New requirement              │
│  Product / brand  [ ______ ]  │
│  What content     [ ______ ]  │  ← e.g. reel, unboxing, review
│  Budget / range   [ ______ ]  │
│  Deadline         [  📅  ]    │
│  Notes            [ ______ ]  │
│         [ Post requirement ]  │
│  Creators who fit can approach│
└───────────────────────────────┘
```

**My requirements + reach-out**
```
┌───────────────────────────────┐
│  My requirements              │
│  • “Summer reel”  3 approached│ → thread (brief 12)
│  • “Unboxing”     open        │
│                               │
│  Find creators                │
│  [ browse creator pages ]     │ → creator page (brief 01) → “Reach out”
└───────────────────────────────┘
```

- **Requirement form:** product/brand, content type, budget or range, deadline, notes. On
  post, it lists on the **open board** creators can browse and **Approach**.
- **My requirements:** each with how many creators approached → opens the **thread** (brief 12).
- **Find creators:** browse public creator pages; a **Reach out** action sends a collab
  request to that creator's Collabs tab.

## Content & data

Requirement: product/brand, content type, budget/range, deadline, notes, status
(open/closed), approach count. Business identity (name, logo) attached. Outreach: target
creator/profile + message → creates a thread.

## Actions

- **Primary:** Post a requirement; Reach out to a creator.
- **Secondary:** edit/close a requirement; open a thread; browse creators.

## States

- **Default:** form; my-requirements list.
- **Loading:** posting; list skeleton.
- **Empty:** no requirements yet → "Post your first requirement, or browse creators."
- **Error:** validation (missing product/deadline); post failure (retry).
- **Edge cases:** a requirement with many approaches (list them); reaching out to a creator who has no matching profile; closing a requirement mid-conversation (existing threads persist).

## Components

Input/Textarea, Select (content type), date picker, Button, Card/List (requirements), Badge (status/approach count), Toast, Skeleton.

## Theme & accessibility

Business surface can feel a touch more utilitarian than the shopper world, but same tokens.
Clear required-field validation; date picker keyboard-accessible; status via text + color.

## Out of scope (v1)

No creator **discovery-by-performance** (search/filter by audience/metrics), no media-kit
view, no gifting logistics, no campaign management, no on-platform payment — all deferred.
Vetting in v1 = looking at the creator's public page.
