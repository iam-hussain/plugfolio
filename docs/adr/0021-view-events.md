# ADR-0021 — Views are a third append-only event, counted by a client beacon

## Context

The dashboard design (`dashboard.html §Traffic`) renames the Earnings card to
**Traffic** and puts two numbers side by side: views and taps. Its reasoning is
the part that mattered:

> Either alone misleads. 1,284 taps sounds enormous until you see 20,410 views,
> and 20,410 views sounds like reach until you see how few moved.

Plugfolio had taps and coupon-code copies. It had no denominator at all — which
meant the one number the dashboard showed could not be read, only admired. Two
questions had to be answered before views could exist.

**Where a view is counted.** The obvious place is the server render: the public
pages are RSC, so the component tree already runs per request. But an RSC render
happens on prefetch, on prerender at build, and on every bot crawl. Counting
there counts pages nobody looked at, and the tap-through rate — the figure a
creator is meant to act on — would be diluted by traffic that was never a
person.

**What the client is allowed to say.** Taps already refuse a `profileId` from
the request body (§6.4): attribution is derived server-side, so a forged body
cannot misattribute somebody else's numbers. A view is cheaper to forge than a
tap and there are far more of them, so the same rule had to hold — and a page
view has no product to derive a profile from.

## Decision

**A view is an append-only `View` row, written from a client beacon, whose
profile is always derived server-side from the thing that was opened.**

- **`ViewBeacon`** is a `"use client"` component rendering nothing, mounted on
  the creator page, the post page and the product page. It fires once per mount
  and fails silently — a view that goes unrecorded is a missing row, not a
  broken page, and nothing on the page waits on it.
- **The boundary is a discriminated union** on `surface`: `profile` carries a
  `username`, `post` a `postId`, `product` a `productId`. Never a `profileId`.
  "A post view with no post" is a shape the type system simply refuses.
- **`recordView` derives the profile** from the target via `ViewTargetRepository`
  and 404s when it doesn't exist, so a view can't be filed against a stranger.
- **Idempotent on a client-minted key**, exactly like taps (§6.8): in-app
  browsers double-fire, and React strict mode mounts the beacon twice in
  development.
- **Nothing here is a person.** The device id is the same signed anonymous token
  taps use (ADR-0002); no view is ever attributed to an account, and there is no
  session, referrer or fingerprint on the row.
- **The card is renamed to Traffic**, along with the read model
  (`TrafficSummary`), the service (`getTraffic`) and the feature folder. The
  design's argument stands: Plugfolio handles no money and sees no sale (§2.3),
  so "Earnings" promised a number this product cannot produce.

## Consequences

- Views undercount by exactly the population that blocks JavaScript or leaves
  before hydration. That is the correct bias for this number: it undercounts
  humans rather than overcounting robots, and the rate it feeds stays honest.
- Three event tables now back one projection. `TrafficReadRepository.summarize`
  does eight grouped queries instead of five; it is still rebuildable by
  construction, with no stored counters anywhere.
- Because views exist, per-post and per-product pages can show their own two
  numbers where the thing that earned them is — which is where a creator is
  already looking.
- A view is not a read receipt and must not become one. Any future work that
  wants "who viewed this" is a different decision with a different ADR, and it
  would have to answer the account-free promise (ADR-0002) first.

## Status

Accepted. Recorded in `plugfolio-lean-journey.md`; the read model is documented
in `docs/implementation/traffic.md` (superseding `earnings.md`).
