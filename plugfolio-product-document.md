# Plugfolio — Product Document & Product-Owner Brief

*Working reference for the product owner. Last updated: July 2026. Pre-launch.*

---

## 0. To the Product Owner — your mandate

This document describes Plugfolio as currently conceived: what it is, who it serves, its features, its pages, and its flows. **Your job is not just to build what's here — it's to pressure-test and improve it.** Specifically:

1. **Understand the product and the model** (Sections 1–7).
2. **Challenge the differentiation.** Our assumed edge (content-to-product mapping) is *table-stakes* against the market leaders (see Section 2). Help us sharpen a real wedge.
3. **Explore the possibility space** (Section 9) — what should we add, cut, or bet on?
4. **Resolve the open decisions** (Section 10) — monetization, wedge, referral economics, mobile.
5. **Turn this into a prioritized roadmap** with a clear v1 (beachhead) vs. later.

Treat everything below as a strong starting point, not gospel. Push back where you disagree.

---

## 1. Product overview

**One-liner:** *Plugfolio turns a creator's content into a shoppable storefront — one link that makes every reel, video, and post shoppable, trackable, and monetizable.*

**The problem:** Creators influence what millions buy, but the path from "I saw it in their content" to "I bought it" is broken. Links get lost in captions and expiring stories; followers DM "where's that from?"; creators can't see which post drove which sale; brands can't easily find or vet creators.

**The product:** A shoppable **creator profile platform**. Creators connect their socials, map real products to each piece of content, and share one link in their bio. Followers tap any post and shop everything in it — no account needed. Behind the profile sits a storefront, media kit, brand-deal inbox, and analytics.

**Business type:** A **two-sided marketplace** — creators (supply) and shoppers (demand), with brands as a third participant.

---

## 2. Market & positioning (the honest version)

Plugfolio enters a crowded, well-funded category. The product owner must internalize this:

- **Content-to-product mapping is NOT unique.** ShopMy (~175K creators, ~$1.5B valuation) and LTK (~350K creators, ~40M monthly shoppers, ~$6B sales) both already tag products inside reels/videos and both run consumer discovery surfaces. On our "core" feature, we launch at *parity*, not advantage.
- **Link-in-bio is owned by Linktree** (~70M users), which is pushing into shopping too. Beacons and Stan cover all-in-one creator tooling and digital-product sales.
- **Where the whitespace actually is** (build the wedge here):
  1. **Shopper-side referral & rewards loop** — competitors reward *creators*, not *shoppers*. A viral shopper loop is differentiated *and* solves cold-start density.
  2. **Truly open access** — LTK gates on ~5K followers + approval; ShopMy is invite-based. Genuinely open + no-login shopping is an ownable stance.
  3. **A niche or geographic beachhead** — every incumbent chases the same US/UK fitness-beauty-fashion crowd. Winning one vertical or region first is the realistic path in.

**Positioning implication:** lead with the wedge (open + rewards + a focused beachhead), reach *parity* elsewhere, and don't market content-mapping as if it's novel.

*(Full detail in the separate Competitive Analysis doc.)*

---

## 3. Users & the two-sided model

| Audience | Role | Access model | Primary goal |
|---|---|---|---|
| **Creators** | Supply — build the shops | **Register / gated** | Turn content into revenue; look pro to brands |
| **Shoppers / followers** | Demand — browse & buy | **No login, ever** | Shop what creators use, frictionlessly |
| **Brands** | Partners — fund the ecosystem | Light gated (later) | Find, vet, and work with creators |

**The hard rule:** shoppers never register or log in. Every gate between a follower and a product costs a sale. Only creators (and eventually brands) have accounts. The shopper's "identity" is just their journey: creator link → creator page → product → checkout.

---

## 4. Value proposition & differentiators

**For creators:** one link replaces link-in-bio + shop + media kit + brand inbox + analytics; get discovered on Explore; track every click and dollar.

**For shoppers:** shop what creators actually use, with zero friction and rewards for sharing.

**For brands:** a trusted, measurable way to find and partner with creators.

**Differentiators to lean on (in priority order):** (1) shopper rewards/referral loop, (2) open access + no-login shopping, (3) a focused beachhead, (4) design/mobile-first craft. **Parity features (match, don't over-invest):** content mapping, storefront, media kit, analytics, social sync.

---

## 5. Feature set

### Creator-facing (gated)
- **Content-to-product mapping** — tag real products to any reel/video/post. *(Core UX; parity feature.)*
- **Shoppable storefront** — curated, auto-updating shop at `plugfolio.com/handle`.
- **Social sync** — connect Instagram, TikTok, YouTube; content imports and stays current.
- **Auto-updating media kit** — audience, reach, top content, past collabs; brand-ready.
- **Brand-deal inbox** — brands inquire; creator manages deals in one place.
- **Analytics & attribution** — clicks, top products, coupons, revenue, tied to the source post.
- **Affiliate / links / codes** — own links, affiliate codes, brand offers.
- **Payouts** — earnings and payment settings.

### Shopper-facing (public, no login)
- **Explore** — passive discovery: trending products, top creators, trending coupons, referral bonuses, categories.
- **Discover / Search** — active intent: search + filters (category, price, creator, brand), graceful no-results.
- **Individual creator pages** — the shoppable profile; tap content → shop products.
- **Product view** — details, price, buy path, creator attribution.
- **Coupons / deals** — creator codes, grabbable with no login.
- **Referral rewards** — share a shop/product → friend buys → both earn. *(Priority differentiator.)*

### Brand-facing (later)
- **Creator discovery** — find creators by niche, audience, performance.
- **Media-kit view + inquiry** — vet a creator and reach out.
- *(Future: campaign/collab management, gifting, performance dashboards.)*

---

## 6. Pages & surfaces (sitemap)

**Marketing (public):**
- Coming-soon / pre-launch page *(built)*
- Product landing page — explains the product & features, converts creators *(built)*

**Shopper (public, no login):**
- Explore *(built as mockup)*
- Discover / Search
- Individual creator page (`/handle`)
- Product page
- Category pages
- Coupons / deals
- Referral / rewards surface

**Creator (gated):**
- Registration / onboarding (connect socials → import content → map first products)
- Dashboard (home / overview)
- Content-to-product mapping editor
- Storefront editor / customization
- Media kit
- Brand-deal inbox
- Analytics
- Payouts & settings
- Referral / invite (creator growth)

**Brand (later, gated):**
- Brand signup
- Creator discovery / search
- Creator media-kit view + inquiry
- Deal / campaign management

---

## 7. Core user flows

**Shopper — discover to purchase (no login):**
Enter via bio link or Explore → creator page or product → tap content to see tagged products → product detail → buy (out to retailer / checkout) → *(optional)* grab coupon or share to earn rewards. Zero account required at any step.

**Shopper — referral loop (the growth engine):**
Shopper shares a shop/product → friend lands (no login) → friend buys → both unlock rewards → friend is now a sharer. Design this loop to be the primary viral mechanic.

**Creator — onboard to earn:**
Register → connect Instagram/TikTok/YouTube → content auto-imports → map products to posts (add links/affiliate codes) → publish storefront → drop `plugfolio.com/handle` in bio → track clicks/sales, receive brand inquiries, get payouts.

**Brand — find to partner (later):**
Discover creators by niche/performance → view auto-updating media kit → send inquiry → manage collaboration.

---

## 8. Cold-start & growth strategy

A two-sided marketplace is empty until it isn't. Priorities:
- **Creators first** — no creators means nothing to browse. Bias early acquisition to supply.
- **Density before breadth** — a **beachhead** (one niche or region) makes Explore look full with far fewer creators than a global launch.
- **Referral loop as the flywheel** — shopper rewards pull in shoppers *and* signal creators that Plugfolio drives traffic. This is why the loop is a priority, not a nice-to-have.
- **Design Explore to look full when thin** — fewer, larger, editorial modules early; expand as supply grows.

---

## 9. Possibilities to explore (product owner: expand this)

Prompts for improvement and new bets — evaluate, don't assume:
- **Rewards economics & mechanics** — what's the actual shopper reward (credit, cashback, perks, early drops)? Who funds it? Model it.
- **Multi-creator discovery** — a "shop across the creators I trust" view (ShopMy ships "Circles"; is there a better version?).
- **AI discovery / assistant** — "find me X from creators I like" (LTK has an AI shopping chatbot; parity or leapfrog?).
- **Wishlists / saves** — do they require login (contradicts the model) or work anonymously/device-based?
- **Creator collaboration** — creators tagging/boosting each other; collab storefronts.
- **Live / real-time** — trending-now surfaces, drops, limited coupons, live shopping.
- **Deeper brand tools** — gifting, campaign management, performance dashboards (this is where ShopMy makes real revenue).
- **Checkout depth** — native checkout vs. affiliate redirect; how much of the transaction do we own?
- **Creator monetization beyond affiliate** — digital products, tips, memberships (Stan/Beacons territory).
- **Mobile app** — is a native shopper app needed to compete on discovery, or is mobile web enough for v1?
- **Trust & authenticity** — reviews, "actually uses this" verification, creator credibility signals.

---

## 10. Open decisions (need answers before/at v1)

1. **Monetization model** — affiliate commission share? creator subscription? brand tools? transaction fee? (Note competitor fee sensitivity — Linktree's 12% is widely criticized.)
2. **The beachhead** — which niche and/or geography do we win first? (A deliberate call, not a default to "everyone.")
3. **Referral economics** — reward type and funding source. Make-or-break for the growth loop.
4. **Checkout ownership** — redirect-to-retailer vs. native checkout (affects attribution, margin, complexity).
5. **Mobile app vs. web-first** for launch.
6. **Brand side timing** — how soon do brand tools come online (they're where incumbents earn)?

---

## 11. Success metrics (proposed — refine)

- **Supply:** creators onboarded, % who map ≥1 product, storefronts published, creator retention.
- **Demand:** shopper visits, taps into creator pages, product taps, coupon grabs.
- **Marketplace health:** products mapped, GMV / attributed revenue, conversion rate, revenue per creator.
- **Growth loop:** referral shares, referred visitors, referral → purchase rate, viral coefficient.
- **Density (beachhead):** creators & products per niche/region — "does Explore look full?"

---

## 12. Brand & experience principles (quick reference)

- **Identity:** "Charged Violet" — Charged Violet `#7C3AED` + Electric Lime `#C6FF3D` (lime as one disciplined accent), violet-tinted dark surfaces, geometric display type. Logo: `plugfolio` wordmark + lime-spark "p" mark.
- **Tone:** modern, confident, energetic, credible, creator-native.
- **Experience rules:** mobile-first; shoppers never hit a login wall; content-to-product is the recognizable UX; accessible and fast.

---

*Companion docs: product landing page + brief, Explore/Discover/creator-page briefs, and the full Competitive Analysis.*
