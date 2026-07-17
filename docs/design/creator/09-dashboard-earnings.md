# 09 — Dashboard: Earnings

- **Route:** `plugfolio.com/dashboard/earnings`
- **Role:** Creator (**Admin** and **Manager** can view)
- **Priority:** P1 — the emotional core ("this reel drove 312 taps")
- **Entry points:** dashboard tab

## Purpose

Show the creator that their content **works** — clicks and outbound taps tied to the exact
post that drove them. **v1 handles no money**, so be scrupulously honest: show traffic, and
show attributed sales **only where the affiliate network reports them**, labeled `tracked`
vs `estimated`.

## Layout (mobile-first, 360px)

```
┌───────────────────────────────┐
│ [Profile ▾]     Earnings      │
│  This week                    │
│  ┌─────────┐ ┌─────────┐      │
│  │ 312     │ │ $214    │      │
│  │ taps    │ │ sales   │      │
│  └─────────┘ └ tracked ┘      │  ← label tracked/estimated explicitly
│                               │
│  Top posts                    │
│  ┌───────────────────────────┐│
│  │[thumb] “gym haul”  148 taps││
│  │        $96 tracked        ││
│  └───────────────────────────┘│
│  …                            │
│  ⓘ How earnings work (honest) │
└───────────────────────────────┘
```

- **Summary tiles:** taps/clicks and (where available) attributed sales — each with a clear
  `tracked`/`estimated` label. Never imply Plugfolio holds or pays money.
- **Top posts:** the posts driving the most taps, each linking back to the post — this is
  the "this reel made you $X" moment.
- A quiet **"How earnings work"** explainer: creators use their own affiliate links; the
  network pays them directly; Plugfolio measures the traffic.

## Content & data

Append-only tap/click events aggregated per post; where the network reports conversions,
sales figures with a source label. Time range selector (e.g. this week / month / all).

## Actions

- **Primary:** none destructive — this is a read surface.
- **Secondary:** change time range; tap a post → its posts/tagging view; open the explainer.

## States

- **Default:** tiles + top posts.
- **Loading:** tile + row skeletons.
- **Empty:** no taps yet → encouraging "Share your link to start seeing taps here" (not a sad zero).
- **Error:** data load failure (retry).
- **Edge cases:** taps but **no network-reported sales** → show taps confidently and mark sales as "estimated / not reported yet" honestly; brand-new profile (all zeros → empty state).

## Components

Stat tiles/Cards, simple chart or sparkline (optional, keep light), list rows, Tabs (range), Skeleton. (See the **dataviz** guidance if adding any chart.)

## Theme & accessibility

Numbers are the hero — big, legible. Reserve lime for a single positive highlight at most.
`tracked` vs `estimated` must be distinguishable without color (text label + icon). Charts
need accessible text alternatives.

## Out of scope (v1)

No payouts console, no bank details, no Plugfolio-held balance, no coupon analytics, no
best-time-to-post insights — all deferred (money stays out of v1).
