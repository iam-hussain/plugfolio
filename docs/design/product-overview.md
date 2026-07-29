# Plugfolio — Product Overview

*What the product is, what it does, the full feature set by role, and the use cases it serves. This is the "what and why" companion to the [design handoff](./design-handoff.md) (which covers every screen and state). Neither prescribes how anything looks.*

*Scope: v1 ("lean journey"), current as of July 2026. Features tagged **[LATER]** are planned but not yet live.*

---

## 1. In one line

**Plugfolio turns a creator's content into a page where every post is shoppable — and lets their followers buy what they saw, at the retailer, with no account and no checkout.**

A creator posts a reel or photo, tags the products that appear in it, and pins their affiliate or own-store link to each. A follower arriving from the creator's Instagram/TikTok bio taps a post, sees exactly what's in it, taps Buy, and lands on the retailer — three taps, no sign-up, no cart. The creator gets attribution for every tap so they can see which content drives sales.

---

## 2. The core loop

```
Creator makes content  →  tags the products in it  →  publishes a shoppable page
        ↓
Follower taps the bio link  →  taps a post  →  sees the products  →  taps Buy  →  retailer
        ↓
Every tap is recorded  →  the creator sees "this post drove N taps"
```

Everything else in the product supports, protects, or extends this loop.

---

## 3. Who it's for

| Role | Who they are | What they get |
|---|---|---|
| **Shopper** | Someone who follows a creator and wants to buy what they post | A fast, no-login way to shop straight from a post to the retailer. An optional account only if they want to follow, comment, or report. |
| **Creator** | An influencer / content creator who wants to monetize their audience | A shoppable page per profile, product tagging, coupon offers, categories, earnings attribution, team helpers (Managers), and a way to land brand deals. |
| **Business / Brand** | A company looking for creators to promote their products | A way to post what they need, get approached by fitting creators (or reach out directly), and negotiate a collab to agreed terms. |
| **Operator (internal)** | Plugfolio's own trust-and-safety / ops team | A private admin console to moderate content, settle username disputes, triage reports, toggle features, and read platform analytics. |

**One account, many hats.** A single email account can be a shopper, a creator, and a business owner at once — the roles are capabilities layered on one identity, not separate logins.

---

## 4. The rules that define the product

These aren't features — they're the constraints every feature respects.

1. **Shopping never requires an account.** No login wall, modal, or "sign up to continue" ever appears between arriving at a creator page and landing on the retailer. Accounts gate only "act as yourself" actions: follow, comment, report, sell, hire.
2. **v1 handles no money.** Plugfolio never runs a cart, checkout, wallet, or payout. Buy forwards to the retailer through the creator's own link; collab payment settles off-platform.
3. **Attribution is honest.** Every number the product shows is **tracked** (directly measured). Where something can't be measured (in-store coupon redemption), it says so. Nothing is fabricated or estimated in v1.
4. **Built for the in-app browser.** Most shoppers arrive inside Instagram/TikTok's browser, where leaving for email loses the session — so login never depends on an email round-trip, pages are fast, and double-tapped buttons are absorbed cleanly.

---

## 5. Feature catalogue

### 5.1 Shopper features

- **Shop from a post.** Open a creator's page, tap any post, and see exactly the products tagged in it — each with its price and a Buy button that forwards to the retailer. No account, ever.
- **Product pages.** Each product has its own page: image, price, the retailer/own-store destination, any coupon, and a link back to the post it came from.
- **Coupon offers.** A product can carry a coupon — an online code, an in-store code (with a redemption note), or both. Shoppers copy the code with one tap (with a "Copied" confirmation) before heading to the store. In-store-only offers have no Buy button — the code *is* the offer.
- **Own-store vs affiliate signal.** Products the creator sells themselves are marked "their own product" (a trust cue); affiliate picks are unmarked. The action reads "Buy" for affiliate and "Shop their store" for own.
- **Explore / discovery.** A no-login surface to search and browse creators and products by name, for shoppers who didn't arrive via a bio link.
- **Follow a creator** *(optional account)*. Save creators you like; see them on a simple "Following" list. The account is created inline — a sheet over the page — so following never yanks you off what you were doing.
- **Comment & reply** *(optional account)*. Ask a buying question on a creator's page or a product page; creators can answer. You appear by your chosen `@handle` — never your email.
- **Report content** *(no account needed)*. Flag a page, product, or comment (spam / scam / offensive / impersonation / other) straight to the Plugfolio team, without signing in.
- **Get help** *(no account needed)* **[UNCOMMITTED]**. A support form for account problems — deliberately usable even by someone locked out of their account email; replies come by email.

### 5.2 Creator features

- **Account in one step.** Register with email + password, verify once, and you're in. No username asked; login never needs an email link.
- **Connect socials for identity.** Connect a Google (YouTube) account — and, [LATER], Meta (Instagram) — which both unlocks profile creation and proves you own the handle (so `plugfolio.com/yourname` can't be squatted). This is connect-for-identity, not social login.
- **Up to 5 profiles per account.** Run several shoppable pages from one account (e.g. a main channel and a niche one). Each profile is its own public page with its own username, content, categories, and earnings.
- **Instant working page.** A new profile goes live immediately with a temporary random username; you claim your real social-derived handle later ([LATER] for the picker — the rules and random handle ship today).
- **Posts.** Add a post by media URL + caption today; automatic import from connected socials is [LATER]. Hide a post from your public page anytime without deleting it.
- **Product tagging (the core tool).** Paste a product URL — Plugfolio grabs the title, image, and price — then pin your affiliate or own-store link. The post is shoppable the moment you tag it (no publish step). Choose the product kind (affiliate vs your own) and optionally attach a coupon.
- **Product library.** A scannable list of everything you've tagged: fix a broken link, edit a coupon, remove a product (which propagates to every post using it), search by title, and see how many posts each product is on.
- **Coupon offers.** Attach a code with an optional expiry and an optional in-store note; supports online, in-store, or both.
- **Categories ("shelves").** Group your posts and products into named shelves ("Desk setup", "Under ₹500") that shoppers can filter by on your page. Deleting a shelf never deletes content.
- **Earnings attribution.** See your total outbound taps (labeled *tracked*), broken down by which post and which product drove them, plus coupon code-copy counts (in-store copies honestly labeled "redemption not tracked"). No money figures — it's about *what content works*.
- **Profile identity & links.** Give a profile a display name, a picture, a bio, and a row of social links (Instagram / YouTube / TikTok / Facebook / website) shown on your public page.
- **Team helpers (Managers).** Invite up to 3 people per profile to post, tag, manage categories, and work collabs on your behalf — while settings, connections, and the username stay yours alone.
- **Land brand deals (collabs).** Approach open brand requirements, or receive direct requests from businesses browsing your page; negotiate in a thread to agreed terms.

### 5.3 Business / brand features

- **Create a business in one step.** A name, what you sell, and an optional logo — that's the whole sign-up.
- **Post requirements to an open board.** Describe what you need (a brief, an optional free-text budget, an optional deadline). It lists on a board inside creators' dashboards, where fitting creators can approach you. See how many creators approached each requirement, and close a requirement when you're done (existing threads continue).
- **Reach out directly (door two).** Browse any creator's public page and send a collab request straight from it.
- **Negotiate to agreed terms.** In a shared thread, message the creator, propose terms (what gets made, price, deadline), and both sides accept. "Agreed" always means agreed to the *current* terms — any new proposal resets both acceptances. Payment settles off-platform.

### 5.4 Operator (internal admin) features

- **Moderate people and content.** Suspend a member or a single page, remove posts/products/comments, clear an inappropriate logo — all reversible where sensible, all recorded.
- **Settle username disputes.** Release a squatted or impersonating username back to its rightful owner; reset a member's handle.
- **Triage reports.** A queue fed by the account-free shopper report flow, with resolve/dismiss actions.
- **Runtime feature flags.** Turn features on/off without a deploy (comments, reports, support inflow) and manage reserved usernames.
- **Platform analytics.** Read the numbers that matter — taps and code-copies over time, top profiles and products, tap sources.
- **Full audit trail.** Every operator action is logged, append-only.
- **Hardened, separate identity.** Operators are a distinct account type (a product-auth bug can't reach admin), with rate-limited login, short sessions, and revocable access.

---

## 6. Use cases (scenarios)

**A shopper buys from a reel — no account.**
Priya sees a desk-setup reel on Instagram and taps the creator's bio link. She lands on the creator's Plugfolio page inside Instagram's browser, taps the reel's tile, and sees the three products in it — a lamp, a monitor arm, a mat. She taps Buy on the lamp; the button says "Opening…" and she's on the retailer's site. She never made an account, never saw a cart. The creator's tally quietly ticks up by one tap.

**A shopper grabs a coupon.**
On a skincare creator's product page, a shopper sees a code chip. She taps it — "Copied" — then taps "Shop their store" and pastes the code at checkout on the brand's own site. If the offer were in-store-only, there'd be no Buy button at all: the code plus a note ("Show at any Nykaa store") would be the whole thing.

**A shopper follows and asks a question.**
He wants to keep up with a fitness creator, so he taps Follow. A small sheet slides up over the page — email + password, verify — and he's back where he was, now following. Later he asks on a product page whether the resistance bands ship to his city; the creator replies, appearing as the profile with a "Creator" badge. Neither of their emails is ever shown.

**A creator makes a reel shoppable.**
Maya connects her YouTube account, creates a profile, and pastes a post's media URL. She opens the post, pastes the Amazon link to the tripod in the shot — Plugfolio pulls the title, photo, and price — adds her affiliate link, and taps Tag product. Instantly her post shows a shoppable tripod. She adds a 10%-off code for her own preset pack as a second product marked "their own product." A week later her dashboard shows that reel drove 312 taps and the preset code was copied 40 times.

**A creator scales with a helper.**
Maya's audience grows, so she invites an editor as a Manager on her main profile. The editor signs in, sees the profile badged "manager," and can add posts, tag products, and answer collab threads — but the Settings, connections, and username stay Maya's. When the editor moves on, Maya removes them and access ends immediately.

**A brand finds a creator.**
A tote-bag brand creates a business, then posts a requirement: "A 30-second reel featuring our tote, budget $150–300, by next month." It appears on the open board. Maya sees it in her Collabs tab and approaches with an opener. In the thread they message, the brand proposes terms (one reel, $250, by the 20th), both accept, and the thread reads "Agreed — payment settles off-platform." They handle the actual payment between themselves.

**A brand reaches out directly.**
A skincare brand browsing creator pages finds one that fits and taps "Request collab" right on the page. A thread opens in that creator's Collabs, seeded with the brand's message — the same negotiation flow, entered from the other door.

**An operator handles an impersonator.**
A report comes in: someone grabbed `plugfolio.com/nike` and is posing as the brand. An operator opens the reports queue, views the target, releases the username back (it renames the impostor's page to a random handle and frees "nike" for its verified owner), and — if needed — suspends the member. Every step lands in the audit log.

---

## 7. The attribution & honesty model

This is what makes Plugfolio trustworthy to creators and shoppers alike.

- **Taps and code-copies are events, not counters.** Every outbound Buy tap and every coupon-code copy is recorded as an immutable event. Earnings is a rebuildable projection over those events — history never silently shrinks.
- **Attribution never blocks the shopper.** If recording a tap fails, the redirect to the retailer still happens. The shopper's experience always wins.
- **Everything is labeled tracked.** Creators see *measured* taps and copies, tied to the post and product that drove them. There are deliberately no "estimated" numbers in v1 — that would require affiliate networks to report conversions back, which they don't yet.
- **In-store honesty.** Copying an in-store coupon code is counted, but labeled "redemption not tracked" — Plugfolio never implies it saw a purchase it couldn't measure.

---

## 8. What Plugfolio deliberately doesn't do (v1)

Naming these is part of the product: the lean v1 stays focused by leaving them out.

- **No money movement** — no checkout, cart, wallet, payouts, or on-platform payment. Buy forwards out; collab pay is off-platform.
- **No aggregated feed** — "Following" is a simple list, not a content feed.
- **No tracked in-store redemption** — untracked in-store coupons exist; measured redemption/QR does not.
- **No ratings, badges, or media kits.**
- **No drops, bundles, or availability windows.**
- **No TikTok connect, no AI tag suggestions.**
- **No vanity/free-form usernames, no more than 5 profiles or 3 managers, no finer roles.**
- **No creator-to-creator collabs.**
- **No in-app support threads** — support replies go by email.

### Planned but not yet live [LATER]

Instagram/Meta connect · the creator username picker (claiming a real social handle) · automatic post import from socials · video/reels playback · a dedicated earnings view with time ranges and estimated conversions · explore filters and discovery ranking · richer collab inbox states.

---

*For the screen-by-screen product spec (every state, control, and permission), see [`design-handoff.md`](./design-handoff.md). For committed technical decisions, see [`docs/adr/`](../adr/). For v1 scope and rationale, see [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md).*
