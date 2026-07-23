# Plugfolio — Page Design Briefs

Design docs for the **v1 (lean)** product. One brief per page, written for designers.
Everything here is scoped to [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md) —
if a screen or feature isn't in the lean journey's v1, it isn't designed here.

## How to use these

Each brief is a **what & why**, not a **how**. It gives you the page's job, who arrives
and from where, the content and hierarchy, every state to cover, the actions, and the
components — then leaves the visual craft to you. Start from
[`00-foundations.md`](./00-foundations.md); it holds the brand, color tokens, type,
spacing, and shared component rules every page inherits.

**Ground rules for every page** (repeated in foundations):
- **Mobile-first, 360px.** Most shoppers arrive inside Instagram/TikTok's in-app browser. Design that first; scale up after.
- **No login wall on any shopping path.** Shoppers browse and buy with no account.
- **v1 handles no money** — "Buy" leaves to the retailer; collab payment is off-platform.
- **Theme via tokens** (Charged Violet), dark-first with a clean light mode. WCAG AA.

## Page inventory

Priority: **P0** = the core loop (must be flawless); **P1** = supports a v1 journey.

| # | Page | Role | Priority | Brief |
|---|---|---|---|---|
| 01 | Creator Profile Page (`/<username>`) | Shopper (public) | P0 | [shopper/01-creator-profile-page.md](./shopper/01-creator-profile-page.md) |
| 02 | Post View (tagged product) | Shopper (public) | P0 | [shopper/02-post-view.md](./shopper/02-post-view.md) |
| 03 | Product Page | Shopper (public) | P0 | [shopper/03-product-page.md](./shopper/03-product-page.md) |
| 04 | Accounts & Sign-in (all roles) | All | P1 | [accounts/04-accounts-and-sign-in.md](./accounts/04-accounts-and-sign-in.md) |
| 05 | Connect Socials (Google/Meta) | Creator | P0 | [creator/05-connect-socials.md](./creator/05-connect-socials.md) |
| 06 | Create Profile & Choose Username | Creator | P0 | [creator/06-create-profile-and-username.md](./creator/06-create-profile-and-username.md) |
| 07 | Dashboard — Posts & Tagging Editor | Creator | P0 | [creator/07-dashboard-posts-and-tagging.md](./creator/07-dashboard-posts-and-tagging.md) |
| 08 | Dashboard — Products | Creator | P1 | [creator/08-dashboard-products.md](./creator/08-dashboard-products.md) |
| 09 | Dashboard — Earnings | Creator | P1 | [creator/09-dashboard-earnings.md](./creator/09-dashboard-earnings.md) |
| 10 | Profile Settings & Managers | Creator | P1 | [creator/10-profile-settings-and-managers.md](./creator/10-profile-settings-and-managers.md) |
| 11 | Business — Post a Requirement & Find Creators | Business | P1 | [business/11-post-requirement-and-find-creators.md](./business/11-post-requirement-and-find-creators.md) |
| 12 | Collabs & Negotiation Thread | Creator + Business | P1 | [business/12-collabs-and-thread.md](./business/12-collabs-and-thread.md) |
| 13 | Products & Offers (affiliate · own · coupon) | Shopper + Creator | P0 | [13-products-and-offers.md](./13-products-and-offers.md) |

## Admin console

The internal operator app (`apps/admin`, ADR-0014) has its own all-screens brief —
login + twelve console screens, desktop-first, same tokens and UI kit:
[admin-console.md](./admin-console.md).

## Change briefs

Product changes that arrive after a page brief was written get a **change brief** rather
than a rewrite of the affected pages:

- [change-brief-handles-and-categories.md](./change-brief-handles-and-categories.md) —
  member handles (`@handle`) + comment identity, and per-profile categories (July 2026).

## Brief template

Every page brief follows the same shape: **Purpose · Who arrives & from where · Layout
(mobile-first) · Content & data · Actions · States · Components · Theme & accessibility ·
Out of scope**. If you add a page, copy that structure.

## What is deliberately NOT designed in v1

Do not design these — they're deferred (see the lean journey's "left out" table):
Explore/discovery feed, search, referral/share-to-earn rewards, anonymous wishlist &
alerts, aggregated "My Creators" feed, tracked in-store redemption (the *untracked*
in-store coupon channel IS in v1 — see brief 13), star ratings & the "actually uses
this" badge, media kit, drops/bundles, TikTok, on-platform payments/payouts & checkout.
