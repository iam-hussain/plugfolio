# Plugfolio — Product Specification & Design Document

*Structured spec built from the Product Document & Competitive Analysis. July 2026. Pre-launch.*

**Companion docs:** [`plugfolio-product-document.md`](./plugfolio-product-document.md) (product-owner brief) · [`plugfolio-competitive-analysis.md`](./plugfolio-competitive-analysis.md) (market landscape)

---

## Table of contents

1. [Product summary](#1-product-summary)
2. [Personas & roles](#2-personas--roles)
3. [Platform strategy — Web vs. Mobile](#3-platform-strategy--web-vs-mobile)
4. [Visitor (shopper) journey](#4-visitor-shopper-journey)
5. [Content editor (creator) journey & dashboard](#5-content-editor-creator-journey--dashboard)
6. [Feature-by-feature analysis with improvements](#6-feature-by-feature-analysis-with-improvements)
7. [High-Level Design (HLD)](#7-high-level-design-hld)
8. [Low-Level Design (LLD)](#8-low-level-design-lld)
9. [UML diagrams](#9-uml-diagrams)
10. [Prioritized roadmap](#10-prioritized-roadmap)
11. [Open decisions](#11-open-decisions)

---

## 1. Product summary

**Plugfolio turns a creator's content into a shoppable storefront** — one link (`plugfolio.com/handle`) that makes every reel, video, and post shoppable, trackable, and monetizable.

Two-sided marketplace:

- **Visitors / shoppers** (demand) — browse and buy with **zero login, ever**.
- **Content editors / creators** (supply) — gated accounts with a full dashboard to import content, map products, and track earnings.
- **Brands** (later) — light-gated tools to discover and partner with creators.

**Strategic wedge (from the competitive analysis):** content-to-product mapping is *parity* (LTK, ShopMy already do it). The differentiators to lead with, in order:

1. **Shopper-side referral & rewards loop** — nobody rewards shoppers for sharing.
2. **Truly open access + no-login shopping** — LTK gates at ~5K followers; ShopMy is invite-only.
3. **A focused beachhead** (one niche or region) to build density fast.
4. **Design & mobile-first craft.**

---

## 2. Personas & roles

| Persona | Also called | Account | Surfaces used | Primary goal |
|---|---|---|---|---|
| **Visitor** | Shopper, follower | **None — hard rule** | Public web (Explore, creator pages, product pages) | Shop what creators actually use, frictionlessly |
| **Content editor** | Creator | Registered, open to all (no follower minimum) | Creator dashboard (separate gated app area) | Turn content into revenue; look professional to brands |
| **Brand** | Partner | Light-gated (later phase) | Brand portal | Find, vet, and work with creators |
| **Platform admin** | Internal ops | Internal | Admin console | Moderation, catalog hygiene, rewards fraud control |

**The hard rule restated:** every gate between a visitor and a product costs a sale. Visitor identity is anonymous/device-based only (needed for referral attribution and wishlists — see §6.10).

---

## 3. Platform strategy — Web vs. Mobile

**Recommendation: web-first, mobile-web-first.** Visitors arrive from a bio link tapped inside Instagram/TikTok's in-app browser — that *is* mobile web. A native shopper app before density exists would be an empty app. Creators do heavy editing (mapping products, editing storefronts) which favors desktop web, plus quick checks on mobile.

- **v1:** Responsive web app, designed mobile-first. PWA installability (add-to-home-screen, offline shell) as cheap "app-like" polish.
- **v1.5:** Creator companion needs on mobile web: notifications via web push, quick-map flow.
- **v2 (decision gate):** Native shopper app **only if** metrics show repeat-visit intent that web can't serve (push-driven drops, live shopping). Native creator app only if quick-map from phone becomes the dominant workflow.

### Feature availability matrix — Web vs. Mobile

Legend: ✅ full · 🔶 optimized/reduced · ⏳ later · ❌ not planned

| Feature | Desktop web | Mobile web (v1) | Native app (v2, conditional) | Notes |
|---|---|---|---|---|
| **Visitor** |
| Explore feed | ✅ | ✅ *primary surface* | ⏳ richer (push, video feed) | Mobile is the majority entry point |
| Discover / search | ✅ | ✅ | ⏳ | Filters collapse into bottom sheet on mobile |
| Creator page (`/handle`) | ✅ | ✅ *primary surface* | ⏳ | Opens inside IG/TikTok in-app browsers — must be fast & light |
| Product view + buy-out | ✅ | ✅ | ⏳ | Redirect to retailer; attribution link wrapping |
| Coupons / deals | ✅ | ✅ | ⏳ | One-tap copy on mobile |
| Referral share & rewards | ✅ | ✅ *native share sheet* | ⏳ push notifications on reward events | Mobile share sheet is the growth engine |
| Anonymous wishlist | 🔶 localStorage | 🔶 localStorage | ⏳ synced if app account exists | Device-based, no login |
| **Content editor** |
| Registration / onboarding | ✅ | ✅ | ⏳ | Social OAuth works fine on mobile |
| Dashboard overview | ✅ | 🔶 read-mostly | ⏳ | Stats cards + notifications on mobile |
| Content-to-product mapping editor | ✅ *primary surface* | 🔶 "quick map" simplified flow | ⏳ camera/share-target integration | Full editor is desktop-grade; mobile gets a one-post-at-a-time flow |
| Storefront editor | ✅ | 🔶 reorder + toggle only | ❌ | Layout editing is desktop work |
| Media kit | ✅ view + edit | 🔶 view + share | ⏳ | Sharing a media kit happens from a phone in a DM |
| Brand-deal inbox | ✅ | ✅ | ⏳ push | Reply speed matters — full mobile support |
| Analytics | ✅ full | 🔶 summary view | ⏳ | Deep tables desktop-only |
| Payouts & settings | ✅ | 🔶 balance + status | ⏳ | Bank/KYC forms desktop-preferred |
| **Brand (later)** |
| Creator discovery, media-kit view, inquiries | ✅ | 🔶 | ❌ | B2B — desktop web is enough |

---

## 4. Visitor (shopper) journey

### 4.1 What visitors SEE (no login, ever)

| Surface | What's on it |
|---|---|
| **Explore** (`/explore`) | Trending products, top creators, trending coupons, referral-bonus banners, category tiles. Editorial modules sized to look full even when supply is thin. |
| **Discover / Search** (`/search`) | Search bar, filters (category, price, creator, brand), results grid, graceful no-results state with suggestions. |
| **Creator page** (`/{handle}`) | Creator identity (avatar, bio, socials), content grid (reels/videos/posts), shoppable storefront section, active coupons, "share this shop" reward prompt. |
| **Product page** (`/{handle}/p/{product}`) | Product details, price, images, the content it appeared in, creator attribution, buy button, coupon if available, share-to-earn prompt. |
| **Category pages** (`/c/{category}`) | Curated products + creators in a category. |
| **Coupons / deals** (`/deals`) | Grabbable creator codes — copy without login. |
| **Rewards surface** (`/rewards`) | How the referral loop works, the visitor's earned rewards (device/link-based), how to redeem. |

### 4.2 What visitors can DO

- Browse everything above with **no account**.
- Tap any content piece → see tagged products → tap through to product.
- **Buy** — redirected out to the retailer through an attributed link (v1; native checkout is an open decision).
- **Grab a coupon** — one-tap copy.
- **Share to earn** — generate a personal share link for a shop/product; when a friend buys through it, both earn a reward. Attribution via link token + device fingerprint (no login).
- **Save to wishlist** — anonymous, device-local (localStorage), with a soft "claim your wishlist" path if they ever want cross-device sync.
- Report a listing / broken link.

### 4.3 Visitor journey map

```mermaid
journey
    title Visitor journey — from bio link to reward
    section Arrive
      Tap link in creator bio: 5: Visitor
      Land on creator page (fast, no login wall): 5: Visitor
    section Browse
      Scroll content grid: 4: Visitor
      Tap a reel to see tagged products: 5: Visitor
      Open product detail: 4: Visitor
    section Convert
      Grab coupon code: 5: Visitor
      Tap Buy and go to retailer: 4: Visitor
      Complete purchase on retailer site: 3: Visitor
    section Grow (the loop)
      See share-to-earn prompt: 4: Visitor
      Share link via share sheet: 5: Visitor
      Friend buys and both earn a reward: 5: Visitor
      Return to redeem and browse Explore: 4: Visitor
```

### 4.4 Visitor flow (decision view)

```mermaid
flowchart TD
    A[Entry] -->|Bio link| B["Creator page /handle"]
    A -->|Direct / SEO / shared link| C[Explore]
    A -->|Referral share link| B
    C --> D{Intent?}
    D -->|Passive browse| E[Trending products and creators]
    D -->|Active search| F[Discover / Search + filters]
    E --> B
    F --> B
    F --> G[Product page]
    B -->|Tap content| H[Tagged products overlay]
    H --> G
    B -->|Storefront section| G
    G --> I{Action}
    I -->|Buy| J[Redirect to retailer with attribution]
    I -->|Grab coupon| K[Code copied - no login]
    I -->|Share to earn| L[Personal share link created]
    I -->|Save| M[Anonymous wishlist - device local]
    L -.->|Friend visits and buys| N[Both earn reward]
    N --> O[Rewards surface - redeem]
    J --> P[Purchase attributed to creator and post]
```

---

## 5. Content editor (creator) journey & dashboard

Content editors get a **separate, gated dashboard** at `plugfolio.com/dashboard` (or `dash.plugfolio.com`) — completely distinct from the public visitor surfaces. Public pages are the *output*; the dashboard is the *workshop*.

### 5.1 Onboarding journey

```mermaid
flowchart LR
    A[Sign up - email or social OAuth] --> B[Claim handle]
    B --> C[Connect socials: IG / TikTok / YouTube]
    C --> D[Content auto-imports]
    D --> E[Map first products to a post]
    E --> F[Storefront auto-generated]
    F --> G[Publish + drop link in bio]
    G --> H[First analytics: clicks, taps, sales]
```

**Activation metric:** % of registrants who map ≥1 product and publish. Every onboarding step should be skippable-but-nudged; the "aha" is seeing their own content become shoppable.

### 5.2 Dashboard — sections & what editors can do

| Dashboard section | Route | What the editor can do |
|---|---|---|
| **Overview (home)** | `/dashboard` | At-a-glance stats (visits, clicks, sales, earnings), unmapped-content nudges, brand inquiries, announcements. |
| **Content** | `/dashboard/content` | See all synced posts across platforms; filter mapped/unmapped; open the mapping editor; hide posts from the public page; re-sync. |
| **Mapping editor** | `/dashboard/content/{id}` | Tag products onto a post: search product catalog, paste any product URL (auto-scraped), attach affiliate link/code, position tags, preview visitor view, publish. |
| **Products** | `/dashboard/products` | Manage the product library: edit details, replace dead links, group into collections, see per-product performance. |
| **Storefront** | `/dashboard/storefront` | Customize the public page: section order, featured collections, theme within brand system, bio/links, preview as visitor, publish. |
| **Media kit** | `/dashboard/media-kit` | Auto-generated from synced stats (audience, reach, top content, past collabs); editor curates highlights; share as public link/PDF. |
| **Brand inbox** | `/dashboard/inbox` | Receive/respond to brand inquiries, track deal status (new → negotiating → active → done), attach deliverables. |
| **Analytics** | `/dashboard/analytics` | Clicks, top products, coupon usage, revenue — **attributed to the source post**. Date ranges, export. |
| **Coupons & links** | `/dashboard/offers` | Create/manage coupon codes, affiliate links, brand offers; toggle visibility on public page. |
| **Payouts** | `/dashboard/payouts` | Earnings balance, payout history, payment method, tax info. |
| **Referrals** | `/dashboard/referrals` | Invite other creators; track referral earnings (creator-growth side of the loop). |
| **Settings** | `/dashboard/settings` | Handle, profile, connected accounts, notifications, danger zone. |

### 5.3 Editor journey map

```mermaid
journey
    title Content editor journey — onboard to earn
    section Onboard
      Sign up and claim handle: 5: Editor
      Connect Instagram TikTok YouTube: 4: Editor
      Watch content auto-import: 5: Editor
    section Create
      Map products to top posts: 4: Editor
      Customize storefront: 4: Editor
      Publish and update bio link: 5: Editor
    section Operate
      Check analytics on source posts: 5: Editor
      Reply to brand inquiry in inbox: 4: Editor
      Create coupon for followers: 4: Editor
    section Earn
      See attributed revenue: 5: Editor
      Receive payout: 5: Editor
      Invite another creator: 4: Editor
```

---

## 6. Feature-by-feature analysis with improvements

Each feature: what it is → visitor vs. editor view → web/mobile notes → **improvements** (gaps found while pressure-testing) → priority. Priority tags: **P0** = v1 launch, **P1** = fast-follow, **P2** = later.

### 6.1 Content-to-product mapping — *parity feature, P0*

- **What:** Tag real products onto any imported reel/video/post.
- **Editor:** Full mapping editor (desktop-first); mobile "quick map" for one post at a time.
- **Visitor:** Taps content → product overlay → product page.
- **Improvements:**
  1. **URL-paste auto-scrape** — paste any product URL, we extract image/title/price (ShopMy's Snapshop does this via extension; we can do it server-side with zero install).
  2. **Bulk mapping** — map one product across many posts at once (haul videos reuse items).
  3. **AI-suggested tags** — vision model proposes products from the frame; editor confirms. P1 — big editor-time saver, and a leapfrog vs. manual-only incumbents.
  4. **Dead-link detection** — nightly job flags 404/out-of-stock product links; nudge editor. Silent dead links are the #1 trust killer.
  5. Timestamped tags for long-form YouTube ("products at 4:32"). P2.

### 6.2 Shoppable storefront — *parity, P0*

- **What:** Auto-updating shop at `/{handle}`, generated from mapped products.
- **Improvements:**
  1. **Collections** (e.g. "My gym kit", "Desk setup") — curation beats a flat grid.
  2. **Customization depth as an edge** — ShopMy is criticized for limited customization; give editors real layout/theming control within the brand system.
  3. Pin/feature products; auto-sections ("Most clicked this week").
  4. Out-of-stock auto-hide (ties to dead-link detection).

### 6.3 Social sync — *parity, P0*

- **What:** Connect IG/TikTok/YouTube; content imports and stays current.
- **Improvements:**
  1. **Graceful degradation** — APIs break and rate-limit constantly; build manual upload/paste-a-post-URL fallback from day one.
  2. Sync status visibility in dashboard ("last synced 2h ago", errors surfaced plainly).
  3. Webhook-based (where platforms allow) over pure polling; poll tiers by creator activity. P1.
  4. Import history so a re-auth doesn't duplicate content.

### 6.4 Explore (visitor discovery) — *parity entering a mature space, P0*

- **What:** Trending products/creators/coupons, categories, referral banners.
- **Improvements:**
  1. **Design-for-thin-supply** — editorial modules (few, large, curated) until density exists; module system that swaps curated → algorithmic per section as supply grows.
  2. Beachhead-first ranking: boost the chosen niche/region so Explore feels dense there.
  3. Anonymous personalization — recently-viewed and category affinity from device storage, no login. P1.
  4. "New creators" module — open access means small creators must get seen, or the open-access wedge is hollow marketing.

### 6.5 Discover / Search — *P0 (basic), P1 (good)*

- **Improvements:**
  1. Graceful no-results with category/creator suggestions (already specced — keep).
  2. Search creators *and* products *and* coupons in one box, tabbed results.
  3. AI/semantic search ("minimal white sneakers under $100") — LTK has an AI chatbot; parity here is P2, don't over-invest pre-density.

### 6.6 Referral & rewards loop — *THE differentiator, P0*

- **What:** Visitor shares a shop/product → friend buys → **both** earn.
- **Improvements / must-solve:**
  1. **Define the reward** (open decision): recommended v1 = **platform credit funded from the affiliate commission margin** — no external cash cost, redeemable against future purchases via partner coupons. Model it before build.
  2. **No-login attribution design** — share token in URL + device fingerprint + claim-on-redeem. Accept imperfect attribution; err generous.
  3. **Fraud controls from day one** — self-referral detection, velocity caps, device clustering. A gamed rewards loop kills the economics silently.
  4. Reward-state visibility without login ("You've earned X — here's your claim link") via the share link itself as identity.
  5. Make sharing ambient: share CTA on product, post-coupon-grab, and post-purchase-redirect pages.
  6. **Creator-side referral too** (invite creators, earn) — separate loop, dashboard section, P1.

### 6.7 Media kit — *parity (Beacons headline feature), P1*

- **Improvements:**
  1. Auto-updating from sync stats — zero-maintenance is the whole value.
  2. Public share link with view tracking ("Brand X viewed your kit").
  3. PDF export for email pitches.
  4. Don't over-invest — match Beacons, don't beat it.

### 6.8 Brand-deal inbox — *P1 (inbox), P2 (marketplace)*

- **Improvements:**
  1. v1 can be as simple as a structured contact form → dashboard inbox (public "work with me" button on creator page).
  2. Deal pipeline states beat free-text email threads.
  3. Full brand portal (discovery, campaigns, gifting) is **P2 but strategically vital** — it's where ShopMy/LTK make real revenue. Sequence it once creator density exists.

### 6.9 Analytics & attribution — *P0 (core), P1 (depth)*

- **Improvements:**
  1. **Post-level attribution is the emotional hook** — "this reel made you $214" is the retention feature. Lead dashboards with it.
  2. Attribution chain must survive the retailer redirect: wrapped links + subid params on affiliate networks.
  3. Coupon-code attribution as fallback where link attribution breaks.
  4. Honest data labeling — show "tracked" vs. "estimated" revenue; creators distrust inflated numbers.

### 6.10 Anonymous wishlist — *P1*

- **Resolves the open question:** device-local (localStorage) — no login, consistent with the hard rule. Cross-device sync only via optional email-magic-link "claim", never a wall.
- ShopMy keeps wishlist items commissionable indefinitely — match that.

### 6.11 Coupons / deals — *P0*

- **Improvements:**
  1. One-tap copy + auto-open retailer.
  2. Expiry/scarcity display ("2 days left") — drives urgency and repeat visits.
  3. Coupon-grab as attribution event (feeds analytics + rewards).

### 6.12 Payouts — *P0 (must work), keep minimal*

- Stripe Connect (or regional equivalent for a non-US beachhead — verify per chosen region). Balance, history, threshold payouts. No innovation needed here; reliability only.

---

## 7. High-Level Design (HLD)

**Stack assumptions:** Next.js (App Router) + TypeScript, Node.js services, PostgreSQL, Redis, object storage + CDN. Public surfaces are SSR/ISR for speed and SEO; dashboard is an authed SPA region of the same app.

```mermaid
flowchart TB
    subgraph Clients
        V[Visitor - mobile web / desktop, no auth]
        E[Content editor - dashboard web app]
        B[Brand portal - later]
        A2[Admin console]
    end

    subgraph Edge
        CDN[CDN + edge cache - public pages ISR]
    end

    subgraph App["Next.js application"]
        PUB[Public surfaces - Explore, /handle, product, deals, rewards - SSR/ISR]
        DASH[Creator dashboard - authed]
        API[API layer - REST/tRPC]
    end

    subgraph Services["Backend services (Node.js)"]
        AUTH[Auth service - creators only, OAuth + sessions]
        SYNC[Social sync workers - IG / TikTok / YouTube]
        CAT[Product catalog service - URL scraper, dead-link checker]
        ATTR[Attribution service - link wrapping, click tracking, subids]
        REW[Rewards engine - share tokens, reward ledger, fraud checks]
        ANA[Analytics pipeline - events to aggregates]
        PAY[Payout service - Stripe Connect]
        NOTIF[Notifications - email + web push]
    end

    subgraph Data
        PG[(PostgreSQL - core domain)]
        RD[(Redis - cache, queues, rate limits)]
        OBJ[(Object storage + CDN - media)]
        EVT[(Event store / warehouse - click and view events)]
    end

    subgraph External
        SOC[Instagram / TikTok / YouTube APIs]
        RET[Retailers and affiliate networks]
        STR[Stripe]
    end

    V --> CDN --> PUB
    E --> DASH
    B -.-> API
    A2 --> API
    PUB --> API
    DASH --> API
    API --> AUTH & CAT & ATTR & REW & ANA & PAY
    SYNC --> SOC
    SYNC --> PG
    SYNC --> OBJ
    CAT --> RET
    ATTR --> RET
    PAY --> STR
    AUTH & CAT & REW & PAY --> PG
    ATTR --> EVT
    ANA --> EVT
    ANA --> PG
    API --> RD
    NOTIF --> E
```

**Key HLD decisions:**

| Decision | Choice | Why |
|---|---|---|
| Public pages | SSR/ISR behind CDN | Creator pages open inside IG/TikTok in-app browsers; must be instant and SEO-visible. |
| Auth scope | Creators (and later brands) only | Visitors never authenticate — enforced architecturally, not just by policy. |
| Social sync | Async workers + queue, webhook where possible | Third-party APIs are slow/flaky; never block user flows on them. |
| Attribution | Dedicated redirect service (`go.plugfolio.com/...`) | Every outbound click passes through us — the analytics and rewards backbone. |
| Events | Append-only event stream, aggregated async | Clicks/views are high-volume; keep OLTP clean. |
| Monolith vs. microservices | **Modular monolith** at v1, workers split out | Pre-launch scale doesn't justify service sprawl. |

---

## 8. Low-Level Design (LLD)

### 8.1 Domain model (ER diagram)

```mermaid
erDiagram
    CREATOR ||--o{ SOCIAL_ACCOUNT : connects
    CREATOR ||--o{ CONTENT_ITEM : owns
    CREATOR ||--|| STOREFRONT : has
    CREATOR ||--o{ COUPON : issues
    CREATOR ||--o{ BRAND_INQUIRY : receives
    CREATOR ||--|| MEDIA_KIT : has
    CREATOR ||--o{ PAYOUT : receives
    SOCIAL_ACCOUNT ||--o{ CONTENT_ITEM : imports
    CONTENT_ITEM ||--o{ PRODUCT_TAG : contains
    PRODUCT ||--o{ PRODUCT_TAG : "tagged via"
    PRODUCT ||--o{ AFFILIATE_LINK : "purchasable via"
    STOREFRONT ||--o{ COLLECTION : displays
    COLLECTION ||--o{ PRODUCT : groups
    SHARE_TOKEN ||--o{ CLICK_EVENT : attributes
    SHARE_TOKEN ||--o{ REWARD : earns
    AFFILIATE_LINK ||--o{ CLICK_EVENT : tracked
    CLICK_EVENT ||--o| CONVERSION : "may become"
    CONVERSION ||--o{ REWARD : triggers
    BRAND ||--o{ BRAND_INQUIRY : sends

    CREATOR {
        uuid id PK
        string handle UK
        string email UK
        string display_name
        string niche
        string region
        enum status "active|suspended"
        timestamptz created_at
    }
    SOCIAL_ACCOUNT {
        uuid id PK
        uuid creator_id FK
        enum platform "instagram|tiktok|youtube"
        string external_id
        string access_token_enc
        timestamptz last_synced_at
        enum sync_status "ok|error|revoked"
    }
    CONTENT_ITEM {
        uuid id PK
        uuid creator_id FK
        uuid social_account_id FK
        enum type "reel|video|post|short"
        string external_url
        string media_url
        boolean visible
        timestamptz posted_at
    }
    PRODUCT {
        uuid id PK
        string title
        string brand_name
        string image_url
        decimal price
        string currency
        string canonical_url
        enum link_health "ok|dead|oos"
        timestamptz last_checked_at
    }
    PRODUCT_TAG {
        uuid id PK
        uuid content_item_id FK
        uuid product_id FK
        uuid affiliate_link_id FK
        int timestamp_sec "nullable, long-form"
    }
    AFFILIATE_LINK {
        uuid id PK
        uuid product_id FK
        uuid creator_id FK
        string target_url
        string network "amazon|rakuten|direct|none"
        decimal commission_rate
    }
    SHARE_TOKEN {
        uuid id PK
        string token UK
        enum sharer_kind "visitor|creator"
        string sharer_device_hash
        uuid subject_creator_id FK
        uuid subject_product_id FK "nullable"
        timestamptz created_at
    }
    CLICK_EVENT {
        uuid id PK
        uuid affiliate_link_id FK
        uuid content_item_id FK "nullable — source post"
        uuid share_token_id FK "nullable"
        string device_hash
        timestamptz occurred_at
    }
    CONVERSION {
        uuid id PK
        uuid click_event_id FK
        decimal order_value
        decimal commission
        enum source "network_postback|coupon_match|estimated"
        timestamptz occurred_at
    }
    REWARD {
        uuid id PK
        uuid conversion_id FK
        uuid share_token_id FK
        enum beneficiary "sharer|buyer"
        decimal amount
        enum status "pending|approved|redeemed|revoked"
    }
    COUPON {
        uuid id PK
        uuid creator_id FK
        string code
        string description
        timestamptz expires_at
        int grab_count
    }
    STOREFRONT {
        uuid id PK
        uuid creator_id FK
        jsonb layout "section order/config"
        enum status "draft|published"
    }
    COLLECTION {
        uuid id PK
        uuid storefront_id FK
        string title
        int sort_order
    }
    MEDIA_KIT {
        uuid id PK
        uuid creator_id FK
        jsonb stats_snapshot
        string public_slug UK
        int view_count
    }
    BRAND {
        uuid id PK
        string name
        string contact_email
    }
    BRAND_INQUIRY {
        uuid id PK
        uuid creator_id FK
        uuid brand_id FK
        enum status "new|negotiating|active|done|declined"
        text message
    }
    PAYOUT {
        uuid id PK
        uuid creator_id FK
        decimal amount
        enum status "pending|paid|failed"
        string stripe_transfer_id
    }
```

Notes: `CLICK_EVENT` lives in the event store, aggregated into Postgres rollups for dashboards. `CONVERSION.source` makes the "tracked vs. estimated" honesty (§6.9) a first-class field. `SHARE_TOKEN.sharer_device_hash` is the no-login identity for rewards.

### 8.2 Module layout (modular monolith)

```
plugfolio/
  apps/
    web/                      # Next.js — public surfaces + dashboard
      app/(public)/           # explore, [handle], p/[product], deals, rewards, c/[category]
      app/(dashboard)/        # dashboard/* — authed layout, editor sections (§5.2)
      app/api/                # route handlers → modules
  packages/
    modules/
      auth/                   # creator sessions, OAuth, handle claims
      content/                # content items, sync ingestion, visibility
      catalog/                # products, scraper, dead-link checker
      mapping/                # product tags, bulk ops, AI suggest (P1)
      storefront/             # layout, collections, publish
      attribution/            # link wrapping, click ingest, conversion match
      rewards/                # share tokens, ledger, fraud rules
      analytics/              # aggregates, per-post revenue
      inbox/                  # brand inquiries, deal states
      payouts/                # stripe connect wrapper
    workers/
      social-sync/            # per-platform pollers + webhook receivers
      link-health/            # nightly dead-link sweep
      event-rollup/           # click/view events → aggregates
    ui/                       # shared design system (Charged Violet)
```

### 8.3 Key API surface (representative, not exhaustive)

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/public/explore` | none | Explore modules (cached, per-region variant) |
| `GET /api/public/creators/{handle}` | none | Creator page payload |
| `GET /api/public/products/{id}` | none | Product detail + attribution context |
| `POST /api/public/share-tokens` | none (rate-limited) | Mint a visitor share link |
| `POST /api/public/coupons/{id}/grab` | none | Coupon grab event |
| `GET /go/{linkId}?st={shareToken}` | none | **Attributed redirect** to retailer |
| `POST /api/dashboard/social-accounts` | creator | Connect a social account (OAuth) |
| `GET /api/dashboard/content?mapped=false` | creator | Unmapped content queue |
| `POST /api/dashboard/content/{id}/tags` | creator | Add product tag (inline URL-scrape) |
| `PUT /api/dashboard/storefront` | creator | Save layout / publish |
| `GET /api/dashboard/analytics/posts` | creator | Per-post attributed revenue |
| `POST /api/webhooks/affiliate/{network}` | HMAC | Conversion postbacks |

### 8.4 Attribution & rewards mechanics (the critical LLD path)

1. Every buy button points at `go.plugfolio.com/{linkId}` with optional `?st={shareToken}`.
2. Redirect service logs `CLICK_EVENT` (link, source post, share token, device hash), appends network subid (`subid=clickEventId`), 302s to retailer. Latency budget: <100 ms.
3. Affiliate network postback → `POST /api/webhooks/affiliate/{network}` → match subid → create `CONVERSION`.
4. Rewards engine: conversion has a share token → run fraud rules (self-referral device match, velocity caps) → create two `REWARD` rows (sharer + buyer), status `pending` → `approved` after the network's return window.
5. Where no postback exists → coupon-code match or `estimated` conversion (labeled as such in analytics).

---

## 9. UML diagrams

### 9.1 Use-case diagram

```mermaid
flowchart LR
    V((Visitor))
    E((Content editor))
    B((Brand))
    S[Social platform APIs]
    R[Retailer / affiliate network]

    subgraph Plugfolio
        UC1[Browse Explore and search]
        UC2[View creator page and tagged content]
        UC3[View product and buy out]
        UC4[Grab coupon]
        UC5[Share to earn rewards]
        UC6[Manage anonymous wishlist]
        UC7[Register and connect socials]
        UC8[Map products to content]
        UC9[Customize and publish storefront]
        UC10[View analytics and attribution]
        UC11[Manage brand inbox]
        UC12[Manage coupons and links]
        UC13[Receive payouts]
        UC14[Share media kit]
        UC15[Discover creators and inquire]
    end

    V --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6
    E --> UC7 & UC8 & UC9 & UC10 & UC11 & UC12 & UC13 & UC14
    B --> UC15
    UC7 -.-> S
    UC3 -.-> R
    UC13 -.-> R
```

### 9.2 Sequence — visitor purchase with referral attribution

```mermaid
sequenceDiagram
    actor F as Friend (new visitor)
    actor V as Visitor (sharer)
    participant P as Plugfolio web
    participant G as Redirect service (go.*)
    participant N as Affiliate network / retailer
    participant RW as Rewards engine

    V->>P: Tap "Share to earn" on product
    P->>P: Mint SHARE_TOKEN (device hash, subject)
    P-->>V: Personal share link
    V->>F: Sends link (share sheet)
    F->>P: Opens link (no login)
    P->>P: Log visit, bind token to session
    F->>P: Browse → tap Buy
    P->>G: GET /go/{linkId}?st={token}
    G->>G: Log CLICK_EVENT + device hash, set subid
    G-->>F: 302 to retailer
    F->>N: Completes purchase
    N->>P: Conversion postback (subid)
    P->>RW: CONVERSION created
    RW->>RW: Fraud checks (self-referral, velocity)
    RW->>RW: REWARD × 2 (sharer + buyer), pending
    Note over RW: Approved after return window
    RW-->>V: Notification via claim link
    RW-->>F: Reward shown on next visit (device/token)
```

### 9.3 Sequence — creator onboarding & first mapping

```mermaid
sequenceDiagram
    actor C as Content editor
    participant D as Dashboard
    participant AU as Auth
    participant SY as Social sync worker
    participant IG as Instagram API
    participant CT as Catalog service

    C->>D: Sign up, claim handle
    D->>AU: Create account + session
    C->>D: Connect Instagram
    D->>IG: OAuth flow
    IG-->>D: Tokens
    D->>SY: Enqueue initial import
    SY->>IG: Fetch recent media
    SY-->>D: CONTENT_ITEMs appear (progressively)
    C->>D: Open post → paste product URL
    D->>CT: Scrape URL (title, image, price)
    CT-->>D: PRODUCT created
    C->>D: Attach affiliate link, position tag, publish
    D-->>C: Live preview — /handle is shoppable
```

### 9.4 State diagram — reward lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: conversion matched to share token
    Pending --> Approved: return window passed + fraud checks clear
    Pending --> Revoked: order returned / fraud detected
    Approved --> Redeemed: visitor claims via reward link
    Approved --> Expired: unclaimed past expiry
    Revoked --> [*]
    Redeemed --> [*]
    Expired --> [*]
```

---

## 10. Prioritized roadmap

### v1 — Beachhead launch (P0)

The minimum that proves the wedge: open access, no-login shopping, working rewards loop, in one niche/region.

1. Creator onboarding + social sync (with manual-URL fallback)
2. Mapping editor (desktop) + URL auto-scrape
3. Public creator page + product page + coupons (mobile-web-first, SSR)
4. Attributed redirect service + click analytics + per-post revenue
5. **Referral rewards loop** (share tokens, ledger, fraud basics)
6. Explore (editorial, thin-supply design) + basic search
7. Payouts (Stripe Connect or regional equivalent)
8. PWA polish

### v1.5 — Retention & parity (P1)

- AI-suggested tags, bulk mapping, dead-link detection
- Storefront collections + customization depth
- Media kit + brand inquiry form/inbox
- Anonymous wishlist, better search, anonymous personalization
- Creator referral program, web push notifications, mobile quick-map

### v2 — Expansion (P2)

- Brand portal (discovery, campaigns, gifting) — the revenue layer
- Native shopper app (only if metrics justify — decision gate)
- AI/semantic search, live/drops surfaces, creator collaborations
- Second niche/region

---

## 11. Open decisions

Carried from the product document, with recommendations from this spec:

| # | Decision | Recommendation in this spec |
|---|---|---|
| 1 | Monetization | Commission share on attributed conversions at v1; brand tools as the v2 revenue layer. Avoid Linktree-style visible transaction fees. |
| 2 | Beachhead | **Must be decided before Explore ranking, region payout rails, and marketing are built.** Deliberate call — this spec is parameterized by it. |
| 3 | Referral economics | Platform credit funded from commission margin (§6.6). Model before build. |
| 4 | Checkout ownership | Redirect-to-retailer at v1 (fastest, no inventory/payments risk); revisit native checkout at v2. |
| 5 | Mobile app vs. web | **Web-first, mobile-web-first, PWA** (§3). Native = v2 decision gate. |
| 6 | Brand-side timing | Inquiry inbox at v1.5 (cheap); full portal at v2 once creator density exists. |
