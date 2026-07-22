# Plugfolio — Lean User Journey

*The neat, simple, clean version. One core loop. Everything else waits.*
*July 2026. This is the product — what we build first, and the spec code follows.*

---

## The one idea

> A creator turns their content into a page where every post is shoppable.
> A follower taps a post and buys. No account, no friction.

That's the whole product for v1. If a feature doesn't serve that sentence, it's not in v1.

---

## Three roles, one clean rule

| | **Shopper** | **Creator** | **Business** |
|---|---|---|---|
| Account to shop / browse? | No | — | — |
| Account for anything else? | Only to **follow or comment** | Yes | Yes |
| Wants | Buy the thing they just saw | Turn content into sales | Find creators to work with |
| Does | Taps a post, buys | Builds shoppable profiles from their socials | Posts a requirement, negotiates a collab |

**The one clean rule: an account is never the price of shopping.** You buy with no account, ever. You only sign in when you want to *act as yourself* — follow a creator, leave a comment, or operate as a business. That's the whole identity model:

> **Shop → no account.  Follow / comment → shopper account.  Sell → creator account.  Hire → business account.**

**How each account signs in:** everyone with an account logs in by **email** — creators, shoppers, and businesses alike. A creator's **username is not a login**; it's a *per-profile* public handle, drawn from their connected YouTube/Instagram, that makes `plugfolio.com/<username>` theirs. One account can run several profiles, so the username can't be the login (see "How a creator account is built" below).

**Every account also gets a member handle.** Whatever the role, each account carries one globally unique **`@handle`** — auto-generated at first sign-in so sign-up stays one step, changeable later in settings. It's how a person appears when they follow or comment (the email is **never** shown), and it is *not* a login either. Member handles are a separate namespace from profile usernames: a profile username is a URL and social-verified; a member handle is display-only, with no public page in v1 — so it can be free-form without inviting squatting.

---

## The shopper journey (no login to shop)

Four steps. Nothing between the follower and the product.

```mermaid
flowchart LR
    A[Tap bio link] --> B[Creator's page]
    B --> C[Tap a post]
    C --> D[See the product · Buy]
```

1. **Arrive.** They tapped `plugfolio.com/handle` from a creator's bio. The page loads instantly and shows the creator, their content grid, nothing else in the way.
2. **Tap a post.** The reel or photo opens with its tagged product shown right there — "this is what's in the video."
3. **See the product.** Photo, price, the post it came from, one Buy button — plus the code to copy when the product carries an offer.
4. **Buy.** The button sends them out — to the retailer through the creator's affiliate link, or to the creator's own store. The network credits the creator directly — Plugfolio just measures the tap. The shopper just shops.

No popup. No signup wall. No wishlist to manage, no rewards to understand, no feed to build. If it isn't "tap, see, buy," it isn't here yet.

**The one optional account.** If a shopper wants to **follow** a creator (so their new posts show up later) or **comment** on a creator's page, *then* they create a lightweight shopper account — email sign-in, nothing more. Buying never asks for it; only these two social actions do. Follow and comment are the *only* things behind that door in v1.

**Who a comment speaks as — a smart default plus a picker.** By default a comment is signed by the commenter's **`@member-handle`**. Anyone who belongs to creator profiles (as Admin or Manager) gets an **identity picker** on the comment box and can speak **as any of those profiles** (brand name + a "Creator" badge) — on any page, including other creators' pages. The default always does the right thing untouched: on a page one of your profiles owns, it preselects **that profile** (owner replies read the way they do on Instagram/YouTube); everywhere else it preselects your personal handle — so speaking as a brand on someone else's page is always a deliberate choice, never an accident.

---

## The creator journey (connect first, then tag)

```mermaid
flowchart LR
    A[Sign up by email] --> B[Connect Google + Meta]
    B --> C[Create a profile]
    C --> D[Pick username from your handles]
    D --> E[Tag products + publish]
```

1. **Sign up by email.** An account is created in one step — **email login, nothing connected yet, no username here.** The username belongs to profiles, not the account (see below).
2. **Connect your socials (whenever you're ready).** After the account exists, the **Admin connects one Google (YouTube) and one Meta (Instagram)** — not required at sign-up, done at the point you want to build a profile. At least one connection is needed to create a profile, and because you can only connect accounts you own, it doubles as proof of the identity behind every username.
3. **Create a profile (up to 5).** From the channels and handles those connections expose, spin up a shoppable profile. Posts import automatically. A **random username** is assigned right away so the page works instantly.
4. **Pick your username.** In profile settings, choose the public handle **from the usernames you actually have on the connected YouTube/Instagram** — nothing else is offered. That becomes `plugfolio.com/<username>`. No follower minimum, no approval.
5. **Tag & publish.** Open a post, paste any product URL — Plugfolio grabs the image, title, and price — add the affiliate link (or mark it as **your own product** and link your store), attach a **coupon code** if you have one, and publish. Drop the link in the social bio.

The moment that sells them: **seeing their own reel become shoppable.** Onboarding drives straight at that and stops.

---

## How a creator account is built — account, profiles, roles

Three words, kept straight:

- **Account** — the login (by **email**). Created on email alone; connects to **one Google and one Meta** any time afterward, and holds **up to 5 profiles**.
- **Profile** — one shoppable page with one username (drawn from a connected handle). It's what a shopper sees at `plugfolio.com/<username>`. One account, many profiles — which is exactly why the username can't be the login.
- **Connected socials** — the YouTube channel and Instagram account a profile is built on (at most one of each).

**Access to a profile — one Admin, up to three Managers.** Every profile has exactly **one Admin** (the account owner) and up to **3 Managers** invited to help run *that* profile. Two roles, nothing more granular in v1:

| Can they… | **Admin** (1 per profile) | **Manager** (up to 3 per profile) |
|---|---|---|
| Connect Google/Meta, create or delete profiles | ✅ | ❌ |
| Edit profile name, username, and settings | ✅ | ❌ |
| Post content and tag products | ✅ | ✅ |
| Change the profile picture | ✅ | ✅ |

**Connection rules:**
- Every profile keeps **at least one** social connected at all times.
- An Admin can **re-authenticate** a connection anytime (for recovery), but **can't fully disconnect a Google or Meta while a profile still depends on it** — delete the profile first.
- If a chosen handle is already taken on Plugfolio, **first verified owner keeps it**; the newcomer stays on their random username until a free handle is picked.

---

## The creator's dashboard — four tabs, not thirteen

The public page is the shop window. The dashboard is the back room, and it stays small. If the account runs several profiles, a **profile switcher** picks which one you're editing; a **Manager** sees every tab except profile settings and connections.

| Tab | What's there |
|---|---|
| **Posts** | Every imported post. Tap one to tag its products. That's the core tool. |
| **Products** | The things they've tagged — affiliate or their own. Fix a link, attach or edit a coupon, remove one. |
| **Earnings** | Clicks and outbound taps, tied to the post that drove them: "this reel drove 312 taps." Where the creator's affiliate network reports conversions back, those sales show too — always honestly labeled *tracked* vs. *estimated*. |
| **Collabs** | Two lists in one place: **open requirements** businesses have posted (approach any that fit) and **incoming requests** from businesses who reached out — each a simple thread to agree content and price. |

No media kit, no coupon scheduler, no payouts console in v1. Four tabs a creator understands in ten seconds.

**v1 handles no money.** The creator brings their own affiliate links; the retailer's network pays them directly, on the network's own schedule. Plugfolio measures the traffic and never sits in the payment path — which is exactly why there's no payout infrastructure to build yet. Plugfolio-owned commissions and payout rails are a deliberate later step (see below).

---

## Categories — the creator's shelves

A profile can group its content into **categories** — each just a **title** and an optional
**description** ("Desk setup", "Budget skincare"). They belong to *that profile*, not to a
site-wide taxonomy.

- A post or product sits in **one category or none**. Uncategorized things are still live —
  they simply show under "All".
- On the public page, category chips above the grid **filter** it; "All" is the default, so
  a profile with no categories looks exactly like today.
- **Admin and Managers** both curate categories — it's content work, same tier as tagging.
- Deleting a category never deletes content; its items just fall back to "All".

One item on multiple shelves, and category pages with their own URLs, are deferred.

---

## Products — three cards, one buy model

Every product on Plugfolio is an **outbound card**: the shopper taps out, Plugfolio
measures the tap. What varies is whose product it is and whether a deal rides along:

- **Affiliate product** — the Buy button goes to the retailer through the creator's own
  affiliate link; the network pays the creator its commission directly.
- **The creator's own product** — the button goes to the creator's own site or store.
  It's their product; no commission language — Plugfolio just measures the traffic.
- **A coupon on either** — any product can carry an offer: a **code**, an optional
  expiry, and its redemption channel — **online** (copy the code, shop through the link),
  **in-store** (show the code at the shop; no link, no Buy button), or **both**. Online
  activity is *tracked* (taps + code copies); in-store redemption happens beyond
  Plugfolio's sight and is labeled honestly (code copies only) — the same *tracked vs
  estimated* discipline as Earnings.

One buy model — **outbound**. No checkout, no cart, and Plugfolio never handles the
money (§2.3). Selling the creator's own goods *through* Plugfolio (digital downloads,
merch, on-platform checkout) is the deliberate later step — see the table below.

---

## The business journey (collabs, both directions)

A business is a brand or store that wants creators to make content. In v1 they get one focused surface — no campaign suites, no dashboards of dashboards — with **two ways to meet a creator**:

```mermaid
flowchart LR
    A[Create business account] --> B{Two doors}
    B --> C[Post a requirement]
    C --> D[Creators approach you]
    B --> E[Reach out to a creator]
    E --> F[Creator replies]
    D --> G[Agree content + price]
    F --> G
    G --> H[Creator delivers]
```

1. **Create a business account.** Name, what you sell, a logo, and an **email** — businesses sign in by email. That's the sign-up.
2. **Post a requirement** *(door one — creators come to you).* Describe the brief: the product, the kind of content you want, a budget or price range, and a deadline. It lists on an open board; creators who fit tap **Approach** and a thread opens.
3. **Or reach out to a creator** *(door two — you go to them).* Browse creator pages, and when one fits, send a collab request straight to their **Collabs** tab.
4. **Bargain in a thread.** Both sides negotiate **content and price** in one simple conversation — what gets made, for how much, by when. No email chains, no DMs.
5. **Agree and deliver.** Once both accept the terms, the creator makes the content. (How money actually changes hands stays off-platform in v1 — same "Plugfolio handles no money" rule; on-platform payment for collabs is a later step.)

That's the entire business side: **post a requirement, or approach a creator, then bargain and agree.** Discovery-by-performance, gifting logistics, and campaign management stay deferred — they're the mature-platform layer, not the first clean version.

---

## What we deliberately left out (and when it can return)

Cutting these is the point. Each is a real feature — just not part of the first clean loop.

| Deferred | Why it waits |
|---|---|
| Referral / share-to-earn rewards | Powerful, but adds an economy to explain before the core loop is even proven. |
| Anonymous wishlist + price alerts | Needs device identity and notification plumbing; not on the buy path. |
| Aggregated "My Creators" feed + Instagram follow-list import | Following a creator is in v1 (see the shopper account); the *payoff* is a simple followed-creators list. The rich aggregated feed and the five-step JSON-import are the deferred part. |
| Tracked in-store redemption (card-linked offers, verified redemptions) | The *untracked* in-store coupon channel is in v1 — show the code at the counter. *Measuring* redemption means card/bank integrations; wait for local density. |
| Ratings + "actually uses this" badge | Commenting is in v1 (behind the shopper account); star ratings and the authenticity badge are the deferred trust layer. |
| Media kit, brand discovery-by-performance, campaign & gifting suites | The heavy brand side. In v1 a business vets creators from their public page and meets them through the Collabs thread — the rest comes after density exists. |
| On-platform collab payments | Collab terms are agreed in v1; money changes hands off-platform for now, same "Plugfolio handles no money" rule. |
| Availability windows, bundles, drops | Merchandising polish. Layer on once the basics convert. (Coupon offers themselves are in v1.) |
| On-platform checkout for creator-owned goods (digital downloads first, then merch/memberships) | **The planned Phase B and the revenue model.** It's the moment Plugfolio handles money — payments, refunds, tax, payouts — and the first exception to no-login shopping. Gated on its own ADR + doc change, after the outbound loop is proven. |
| TikTok (and other platforms) + AI tag suggestions | v1 connects **YouTube + Instagram** (Google + Meta). Other platforms and AI-assisted tagging are scale/convenience layers for later. |
| More than 5 profiles per account · more than 2 role types · more than 3 managers per profile | v1 caps at 5 profiles, and per profile: one Admin + up to 3 Managers, no finer permission matrix. Bigger agency setups come later. |
| Free-form / vanity usernames not tied to a social handle | v1 usernames come only from a connected YouTube/Instagram handle — that's what makes them self-verifying. Arbitrary custom handles are a later, moderated feature. |
| Favorite buyers, creator-to-creator collabs | Relationship infrastructure for a mature platform. (Business-to-creator collab *is* in v1.) |
| Brand-comment gating & moderation (rate limits, "only where tagged / in a collab" rules) | The identity picker *is* in v1; what waits is the anti-self-promo machinery around it. v1 leans on the personal-handle default — gating layers on if brand spam actually shows up. |
| Multi-category items + category landing pages | v1: one category per post/product, chips filter the profile grid via a param. A join table and SEO-able category URLs layer on if creators actually need them. |
| Plugfolio-owned commissions + payout rails | Only needed once Plugfolio sits in the payment path (its own product sales, or owning the affiliate-network relationship to earn a share). In v1 the networks pay creators directly, so there's nothing to remit. |

The rule for adding any of them back: **it must not add a step to "tap, see, buy" or a screen the creator has to learn.**

---

## Success looks like one number per role

- **Creator:** sign-up to a live, shoppable page in under five minutes.
- **Shopper:** bio-link tap to a tracked Buy click in three taps — with zero account.
- **Business:** account to a first creator conversation (post a requirement or send a request) in under five minutes.

If all three are true, the loop works and it funds itself. Everything else is a later chapter.

---

*Deferred features are listed above with the reason each one waits. How we build this — architecture, standards, and committed decisions — lives in [`CLAUDE.md`](./CLAUDE.md) and [`docs/adr/`](./docs/adr/).*
