# Plugfolio — Complete Product Design Handoff

*The single document a designer needs: every role, every flow, every screen, every state, every control — shopper, creator, business, and the internal admin console. This consolidates all the per-page briefs (01–13, admin, change briefs) into one place so you never chase multiple sheets.*

*Version: v1 ("lean journey"), current as of July 2026. Everything described here is built and working today unless tagged **[LATER]** (designed-for, not yet live) or **[UNCOMMITTED]** (in the working tree, not yet on `main`).*

---

## 0. How to read this — what's yours, what's fixed

**The entire visual language is yours.** Color, typography, spacing rhythm, radius, elevation, iconography, illustration, motion, light/dark strategy, the shape of every layout — none of it is prescribed here. This document defines only **product structure**: what each screen is for, who reaches it and from where, what content and controls it holds, every state it must cover, the permission rules, and what the copy *means*. Where this document names copy, treat the **meaning** as fixed and the **wording** as yours to polish.

| Yours to define (all of it) | Fixed (do not change) |
|---|---|
| Full color system, typography, spacing, radius, elevation, iconography, illustration & empty-state art, motion, layout of every screen, light/dark strategy, component look | Flows, information architecture, screen inventory, permission rules, state coverage, copy *meaning*, the no-login-to-shop rule, the no-money rule, the honest-labels rule |

**How your design reaches code (the deliverable contract).** Engineering consumes **semantic design tokens** — components never hardcode values, so one delivered palette/scale restyles the whole product. You deliver the *values*; the token *names* are the seam. Provide values (light **and** dark) for a primary color, an accent/CTA color, page and raised surfaces, primary and muted text, borders, focus ring; plus a radius scale, a type scale (a display face for headings + a body/UI sans), and a spacing scale. Component base is **shadcn/ui** — design within that component grammar and flag any new primitive a screen needs.

---

## 1. What Plugfolio is

> A creator turns their content into a page where every post is shoppable.
> A follower taps a post and buys — at the retailer, with no account and no checkout.

Three roles, one rule each:

| Role | Wants | Account? |
|---|---|---|
| **Shopper** | Buy the thing they just saw in a reel | **Never required to shop.** Optional account only to *follow*, *comment*, or *report*. |
| **Creator** | Turn content into sales | Yes — email + password; owns up to 5 profiles; invites Managers |
| **Business** | Find creators to work with | Yes — email + password; posts requirements, runs collab threads |

**Two golden rules shape every screen:**

1. **An account is never the price of shopping.** No modal, wall, or "sign up to continue" may ever appear on the path from arriving at a creator page to landing on the retailer. Account surfaces exist only for "act as yourself" actions (follow, comment, report, sell, hire).
2. **v1 handles no money.** Buy buttons forward to the retailer through the creator's own affiliate or own-store link. Never design a cart, checkout, wallet, payout, or price total. Collab payment settles off-platform.

One email account can hold any mix of roles. A "shopper account" is just an account with no profiles and no business.

---

## 2. Principles & constraints (product-level, not visual)

1. **Mobile-first.** Most shoppers arrive from an Instagram/TikTok bio link **inside the app's in-app browser**. Design the phone experience first; desktop scales up. No interaction may depend on hover — everything works on first tap.
2. **Speed is a feature.** Public pages are server-rendered and must feel instant in an in-app browser. Keep the shopper path light.
3. **Auth must never depend on an email round-trip to *log in*.** In-app browsers lose the session when the user leaves for a mail app. So login is email + password in one step; email is used only to verify once at registration and to reset a password.
4. **Accessibility is not optional.** WCAG AA contrast, every control keyboard-reachable and labeled, semantic structure, `prefers-reduced-motion` respected.
5. **Honest states.** Every screen below lists its empty / error / busy states — design them all; none are afterthoughts. Metrics are labeled **tracked** (directly measured) and never imply data we don't have. Where redemption can't be measured, we say so ("redemption not tracked").
6. **Double-tap tolerance.** In-app browsers double-fire taps. Action buttons show a busy state (disabled + label change) after the first tap; the backend absorbs duplicates via idempotency keys. Your job is to make single-action feedback obvious.

---

## 3. Complete sitemap & navigation model

Route groups in parentheses are code-only and don't appear in URLs.

```
PUBLIC — no account ever needed
  /                              Landing (role router; not on the shopper hot path)
  /explore                      Discovery: search + browse creators & products
  /[handle]                     Creator page (the shop window)
  /[handle]/post/[postId]       Post view (what's tagged in this post)
  /[handle]/product/[productId] Product page (last step before the retailer)
  /support                      Account-free help inflow  [UNCOMMITTED]
  → external retailer           Buy / Shop their store forwards here

AUTH — shared layout
  /join                         Register (email + password; one verification link)
  /signin                       Log in (email + password, one step)
  /verify                       Consume the verification link
  /forgot                       Request a password-reset link
  /reset                        Set a new password (also the invited-Manager set-password screen)

SHOPPER ACCOUNT — the one optional account
  /account                      Member handle + links to any roles this email holds + sign out
  /following                    Followed-creators list

CREATOR DASHBOARD — inside a persistent shell (top bar + profile switcher + section tabs)
  /dashboard                    Home: active profile, earnings summary, untagged nudge
  /dashboard/posts              Posts grid + add post
  /dashboard/posts/[postId]     Tagging editor (the core tool) + post hiding
  /dashboard/products           Products library: fix link, edit coupon, remove, search
  /dashboard/categories         Manage the profile's categories ("shelves")
  /dashboard/collabs            Creator's collabs: threads + open-requirements board
  /dashboard/settings           Public profile, links, connections, managers, delete (Admin-gated)

BUSINESS
  /collabs                      Business home: create business, threads, requirements, post a brief
  /collabs/[collabId]           Collab thread (shared by both roles)
```

**Navigation model (this replaces the old "no global nav" model):**

- **Public + shopper-account screens** are wrapped in a persistent **shopper chrome**: a top bar (brand → home, an Explore/search affordance, an account slot) and a mobile **bottom tab bar** with four tabs — **HOME / SHOP / FOLLOWING / ACCOUNT**. Neither ever walls the buy path. (See §5.1.) The landing page uses its own nav/footer, not this chrome.
- **The creator dashboard** has its own persistent shell: brand top bar, a **profile-switcher** dropdown, and a section-tab row (Home · Posts · Products · Categories · Collabs · Settings). Switching profile re-scopes every tab (an active `?profile=` id carries through dashboard URLs).
- **The business surface** has a light chrome (brand → home + Sign out).
- Every sub-page carries a back affordance to its parent.

---

## 4. Roles & permissions (drives what each viewer sees)

| Capability | Anonymous | Shopper acct | Creator **Admin** | Creator **Manager** | Business |
|---|---|---|---|---|---|
| Browse pages/posts/products; Buy; copy a coupon code; read comments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Report a page / product / comment | ✅ (account-free) | ✅ | ✅ | ✅ | ✅ |
| Follow / write a comment / reply | door → claim sheet | ✅ | ✅ | ✅ | ✅ |
| Comment *as a profile* (Creator badge) | — | — | ✅ | ✅ | — |
| See "Request collab" on a creator page | — | — | — | — | ✅ (owns a business, not the page owner) |
| Dashboard: Home/Posts/Products/Categories/Collabs | — | — | ✅ | ✅ (managed profiles) | — |
| Create posts, tag products, edit/remove products, hide posts, assign & manage categories | — | — | ✅ | ✅ | — |
| Settings — change profile **picture** | — | — | ✅ | ✅ | — |
| Settings — name, bio, links, connections, managers, delete profile, username | — | — | ✅ | ❌ (shown disabled / explained, never silently hidden) | — |
| Create profile (needs ≥1 connected social; max 5/account) | — | any signed-in user may become a creator | ✅ | ❌ | ✅ (same rules) |
| Business surface: create business, post requirements, run threads | — | — | — | — | ✅ (one business per account) |

Every profile has exactly **one Admin** (the account owner) and up to **3 Managers**. There is no separate "manager" role row — membership is Admin-or-Manager, and the permission split is enforced in the services, not just the UI. Every write that acts as a profile is re-validated server-side (a removed Manager's brand comment fails even if their form still offers it).

---

## 5. Screen-by-screen specification

Each screen lists: **purpose · who arrives & from where · content & controls in order · behaviors · every state · permission variations · copy meaning · [LATER] markers.** No visual prescriptions — layout and look are yours.

---

### 5.1 Global shopper chrome (wraps every public + shopper-account screen)

**Purpose:** consistent way to get home, discover, and reach your account, without ever walling the buy path.

- **Top bar:** brand mark → home (`/`); an **Explore/search** affordance → `/explore`; an **account slot** — signed-in shows the account entry (avatar, falling back when no picture) → `/account`; signed-out shows a way to log in (→ `/signin`) and a "create your page" call to action (→ `/join?as=creator`).
- **Bottom tab bar (mobile):** four tabs.
  - **HOME** → `/` (active only on exact `/`).
  - **SHOP** → `/explore`; treated as active across `/explore` **and every creator surface** (`/[handle]`, post, product) — all of that is "shopping".
  - **FOLLOWING** → `/following`.
  - **ACCOUNT** → `/account` (also active on `/signin`).
  - The active tab is marked programmatically (`aria-current`); reserved top-level routes don't wrongly light SHOP.
- **Rule:** nothing in this chrome ever interrupts a buy.

---

### 5.2 `/` — Landing page

- **Purpose:** the marketing front door for visitors who *didn't* arrive via a bio link. It routes the three roles and states the no-login promise. It is **not** on the shopper hot path (shoppers land on `/[handle]` directly), so it may be richer than the shop pages.
- **Content in order:** a nav (brand → home; Explore link; role entries that change with session — signed-out: for-creators/log-in + an "Explore creators" call to action; signed-in: Dashboard + Explore + account); a **hero** (value-prop headline, subcopy explaining "follow a creator, tap any post, buy at the retailer — no account, no checkout", an explicit **"no login to shop"** promise, and two calls to action into `/explore`); a **"how shopping works"** three-step explainer (find a creator → tap any post → buy at the retailer, with the honest "we never see your card" note); a **creator + business band** (creator → sign in; business → `/collabs`); a footer.
- **Must NOT contain:** any sign-in *wall*, or any link implying shopping needs an account.
- **States:** session only changes the nav entries. Otherwise static — no loading/empty/error.
- **SEO/AEO:** the page emits structured data (Organization, WebSite, FAQ) restating the visible no-account / how-it-works copy — keep the visible copy and the FAQ answers saying the same thing.

---

### 5.3 `/explore` — Discovery

- **Purpose:** let shoppers who didn't arrive via a bio link find creators and products, then tap through to shop. No login anywhere.
- **Content in order:** a heading + subline; a **viewer note** that differs for guest ("browsing as a guest — search and shop freely, no login needed") vs signed-in ("follow creators to save them"); a **Creators / Products** tab switch (carried in `?tab=`); a **search** box (a plain form that works without JS, carrying `?q=`); a result-count line; a **result grid** of creator cards or product cards.
  - **Creator card:** a representative thumbnail (latest post media; a fallback when none), the creator's name/handle, a short meta line (posts · products), follower count, a "view" affordance. Whole card → `/[handle]`.
  - **Product card:** product image; an **active-coupon chip** showing the code when the product has a live coupon; an **own-store marker** when the product is the creator's own; title; "by @creator"; price (blank when unknown); an action label that reads **Buy** (affiliate) or **Shop** (own). Whole card → the product page — **the card does not tap out**; the outbound tap happens on the product page.
- **Behaviors:** query is trimmed and length-capped; case-insensitive match on creator username / product title; a single page of results.
- **States:** default (populated grid); **empty with a query** ("Nothing matches that search — try widening it."); **empty with no query** ("Nothing here yet — creators are on their way."). Server-rendered, so no separate loading state.
- **[LATER]:** filters (region / following-size / verified), niche chips, trending sort, and pagination / load-more — the underlying data fields don't exist yet. Leave room for a filter row under the search box.

---

### 5.4 `/[handle]` — Creator page (the shop window)

- **Purpose:** the creator's shoppable home — who they are + their content grid, shoppable in one tap. No wall, no popup.
- **Access:** public; a session only *enriches* it. Unknown handle → 404 (§5.24).
- **Content in order:**
  1. **Creator header** — avatar (photo, or a fallback when none), display name (falls back to the handle), `@handle` + follower count, optional bio, a **socials row** (see below), and a right-hand **action slot** that changes per viewer (see "four viewers").
  2. An optional **owner or business band** (see "four viewers").
  3. **Category chips** — an "All" entry (default, always present) plus one chip per category the creator defined, in their order. Tapping a chip filters the grid via `?category=`; the active category's description (when set) shows as a line under the row. A profile with **no categories shows no chip row at all**. An unknown `?category=` silently falls back to All. (Categories detailed in §5.16.)
  4. **Post grid** — the creator's posts, newest-first, each tile → the post view. A post that has tagged products carries a **product-count indicator**; untagged posts still appear (without it). **Hidden posts never appear** to any visitor (see §5.14).
  5. **Comments** — a heading with count, a **Report** affordance for the page, the comment list, and either the composer (signed-in) or a claim band (signed-out). Comments & identity are detailed in §5.19.
- **Socials row:** Instagram · YouTube · TikTok · Facebook · website, in a fixed order; the website entry is labeled by its hostname; each opens in a new tab; an empty set renders nothing. Authored in Settings → "Your links" (Admin-only to edit).
- **"One page, four viewers"** — only the header action slot and any band change; the buy path never does:
  1. **Anonymous shopper** — a **Follow** control that opens the inline claim sheet (never navigates away, never walls the page); the comment area shows the claim band.
  2. **Signed-in shopper** — a working **Follow ↔ Following** toggle (optimistic; disabled while pending; unfollow is a quiet no-op if already gone) and the comment composer.
  3. **Business viewer** (signed-in, owns a business, not the page owner) — everything a signed-in shopper sees **plus** a "You own a business" band with a **Request collab** form (§5.22). Suppressed on your own page.
  4. **Owner** (Admin or Manager of this profile) — **no Follow**; instead owner tools: **Share** (native share sheet; clipboard fallback) and, **Admin only**, **Edit profile** → Settings. Plus a "**This is your page — visitors see exactly this**" band with a Dashboard link; for an Admin whose links are empty it appends a nudge to add links in Settings.
- **States:** default; **empty grid** ("No posts yet."); **empty grid under an active category** ("Nothing here yet — see All." linking back to unfiltered); **empty comments** ("No comments yet.").
- **[LATER]:** video/reels playback (posts render as static media today — no social import yet); header/grid loading skeletons.

---

### 5.5 `/[handle]/post/[postId]` — Post view

- **Purpose:** show one post large and reveal exactly the products tagged in it ("here's what's in this video").
- **Access:** public. A hidden, deleted, or unknown post → 404.
- **Content in order:** a compact creator header; a **back to @handle** link; the post media; the caption (when present); a **tagged-products count**; a list of **tagged-product cards**, each → the product page. Product-card variants (kind + coupon) are in §5.18.
- **States:** default; **empty** ("No products tagged on this post." — reachable, since untagged posts are shown in the grid); 404 on hidden/unknown/deleted.
- **No comments here** (comments live on the profile and product pages).
- **[LATER]:** video embeds + a "watch on Instagram/YouTube" tap-out fallback; media/product skeletons; a Report affordance for a post (the backend supports a `post` report target, but no post Report UI is wired).

---

### 5.6 `/[handle]/product/[productId]` — Product page

- **Purpose:** the last step before the sale — product, price, kind/coupon, the source post, and one outbound action, tracked so the creator gets credit. No checkout on Plugfolio.
- **Access:** public. Unknown product/handle → 404.
- **Content in order:** a compact creator header; a **back to @handle** link; the product image (when present); an **own-product marker** when the product is the creator's own; the title; the price (hidden when unknown — never "$0") with a **kind/channel line** ("their own product · opens {retailer}" / "affiliate pick · opens {retailer}" / "in-store offer" when there's no link); a **coupon block** *above* the button when a coupon exists (copy-the-code-then-go order); the **outbound button** (labeled **Buy** for affiliate or **Shop their store** for own — and **absent entirely** for an in-store-only product with no link, where the code is the whole action); an off-platform helper line ("Payment settles off-platform · opens the retailer"); a **"From this post"** thumbnail linking back to the source post (when known); a **Comments** section (heading + count, a **Report** affordance for the product, the product's own comment thread, and the composer/claim).
- **Buy behavior (see §5.7):** on tap, records an outbound tap and forwards to the link — success *or* failure, the redirect happens; while pending the button is disabled and its label becomes "Opening…".
- **States:** default; **no price** → price line hidden; **in-store-only** → no outbound button (must not look broken — the code is the action); **expired coupon** → the coupon block collapses to "Offer ended · the product is still available below." (the product survives its deal); **empty comments** ("No comments yet."); 404 on unknown.
- **[LATER]:** a dead/broken-affiliate-link shopper state (no link-health flag surfaced today); image gallery/carousel (single image today); loading skeletons.

---

### 5.7 Buy / outbound-tap interaction (component-level)

Tap the outbound button → it disables, its label becomes "Opening…", a **tap event is recorded in the background** (with a fresh idempotency key, carrying the source post id when known), and the browser navigates to the retailer link. Requirements: obvious single-action feedback (double-taps must feel absorbed, not broken); no interstitial, no confirmation, no account prompt, ever; **failure of recording is invisible to the shopper — the redirect still happens.** An outbound tap on a link-less (in-store-only) product is rejected server-side as a forged event. This attribution is what powers Earnings.

---

### 5.8 Coupon block & copy-code (component-level)

- **Coupon block** (on the product page): a **channel label** derived from what the coupon supports — "Online & in-store code" / "In-store code" / "Online code" — the code, an optional **in-store note** (the redemption instruction), and an optional expiry line ("Valid till {date}"). On tagged-product cards a compact variant shows just the code chip + optional expiry.
- **Copy-code button:** shows a "CODE" label + the literal code (always fully visible). Tap → writes to clipboard → shows an inline **"Copied"** confirmation for a couple of seconds (announced politely — **not a toast**, since in-app browsers clip toasts). A clipboard denial fails silently — the code is still readable; the card never errors.
- **Attribution:** copying fires a **code-copy event** (append-only, idempotent, carrying the source post id when copied on a post) — Earnings counts it. Recording never blocks the copy. A code-copy on a code-less product is rejected server-side.

---

### 5.9 Product kinds & coupon offers — the variant matrix

Every product is **outbound** — Plugfolio never shows a cart, checkout, or total. A product has a **kind** (`affiliate` — a retailer link; or `own` — the creator's own store), a **nullable link**, and an optional **coupon** (code + optional expiry + optional in-store note). Own products carry a quiet **"their own product"** trust marker; affiliate products are unmarked. The outbound button is labeled by kind (**Buy** vs **Shop their store**); behavior is identical.

| Variant | Marker | What shows | Action & behavior |
|---|---|---|---|
| Affiliate, no coupon | — | image, title, price, "opens retailer" | **Buy** → tracked tap → retailer |
| Own, no coupon | "their own product" | + kind marker | **Shop their store** → tracked tap → their store |
| Affiliate + online coupon | code chip | + coupon block | **Copy code**, then **Buy** |
| Own + online coupon | marker + code chip | + coupon block | **Copy code**, then **Shop their store** |
| Any + in-store-only coupon | code chip + in-store note | **no outbound button** | **Copy code** only; the note is the redemption instruction |
| Any + both channels | marker + code chip + note | full coupon block | **Copy code**, then Buy / Shop their store |
| Any + expired coupon | muted "offer ended" | coupon collapses | code no longer copyable; card reverts to its no-coupon variant; product still available |

**Earnings framing (creator side):** coupon products add **code copies** to Earnings, labeled per channel — online copies count toward the tracked story; in-store copies read "copies — redemption not tracked." Never imply Plugfolio saw an in-store sale.

**[LATER] / out of scope:** checkout/cart/totals/payment; coupon auto-apply or link injection; tracked in-store redemption / QR; bundles/drops/availability windows; stacking multiple coupons (one offer per product in v1).

---

### 5.10 Comments & member-handle identity

Comments are readable by anyone; writing needs the one optional account. They live on the **creator page and each product page** (buying questions) — **not** on the post view.

- **Every account has a globally-unique member handle** rendered as `@handle`, auto-generated at first sign-in (registration never asks for it) and editable later on `/account`. It is the person's public name for comments and follows. **The email is never rendered anywhere.** The member handle is **plain text, not a link** in v1. Keep it visually distinct from a **profile username** (which *is* a URL, `plugfolio.com/name`).
- **How a commenter is identified (never by email):**
  - **As a person** — display name + `@handle` (the default for most comments).
  - **As a profile** — the profile name + avatar + a **"Creator" badge**, no handle (the owner-reply treatment shoppers know from Instagram/YouTube).
- **Identity picker:** a user who belongs to one or more profiles (Admin or Manager) gets a "commenting as" control listing their personal `@handle` first, then every profile they belong to — usable on **any** page. A user with no profiles never sees the picker (plain "commenting as @handle"). **Smart default:** on a page owned by one of their profiles, preselect that profile; everywhere else, preselect the personal handle. Selection is **per-comment, never sticky** — there is no account-level "acting as" mode.
- **Composer:** signed-in → a length-capped textarea (empty submissions disabled). Signed-out → a claim band ("**Sign in** to comment — shopping never needs an account.") whose button opens the inline claim sheet (never navigates away).
- **Replies:** one level deep (a top-level comment takes replies; a reply cannot be replied to). "Reply" shows only for signed-in viewers and opens an inline form with the same identity picker; a profile member's reply defaults to speaking as the profile.
- **Handle editor** (on `/account`): one field — current `@handle`, edit → availability check → save. Errors: taken, invalid characters, too short/long. Handle shape is a lowercase slug with a reserved-word list; old handles are not redirected.
- **Feature flag:** when the admin **"comments"** flag is off, the composer is replaced by "Comments are switched off right now." and posting is refused. Default on.
- **States to design:** person-signed vs profile-signed comment; top-level-with-replies (indented); Reply closed/open; empty thread ("No comments yet"); picker single-identity (plain text) vs multi (closed/open, and a long list that scrolls — a Manager can belong to profiles from several owners); handle-edit idle/checking/taken/saved; long handles and profile names truncate; the Creator badge never wraps away from the name.
- **[LATER]:** the pending Follow/Comment does **not** auto-resume after the claim sheet — the user completes verify + sign-in, then taps again. Design a resume affordance as later. Also later: `@handle` profile pages, verified checkmarks, @-mentions, brand-comment moderation UI beyond reporting.

---

### 5.11 Report a page / product / comment

- **Purpose:** let anyone flag content into the admin triage queue.
- **Access:** **account-free** (device-cookie identity, same as shopping); signed-in members report as their `@handle`. Never needs an account, never interrupts the buy path. Gated by the admin **"reports"** flag (default on).
- **Where the affordance appears:** on the **creator page** (targets the page), the **product page** (targets the product), and **each comment row** (an icon-only trigger, targets the comment). **Not** on the post view yet (backend supports a `post` target; no UI wired) — [LATER].
- **Interaction:** the trigger opens a dialog titled "Report {target}" with the reassurance "No account needed. Reports go straight to the Plugfolio team." Body: a **reason** choice — **Spam / Scam / Offensive / Impersonation / Other** — plus an optional note (length-capped). Actions: Cancel / **Send report**.
- **States:** default; submitting (send disabled); **success** ("Thanks — the team will take a look."); **error** (inline, with the server message or a fallback). Closing resets the form.
- **Backend note:** the report captures a snippet of the target at report time (so the queue keeps a preview after a takedown); unknown targets are rejected (random ids can't stuff the queue).

---

### 5.12 `/support` — Help inflow **[UNCOMMITTED]**

*Fully wired backend + a public page present in the working tree, not yet committed. Include it in the design set.*

- **Purpose:** an account-free way to reach the team for account problems — deliberately usable by someone **locked out of their account email** (the top category is "I lost access to my account email").
- **Access:** public, account-free, inside the shopper chrome. Gated by a **"support"** flag (default on). Accepts `?category=` to preselect (the sign-in page's lost-email door deep-links here).
- **Content in order:** a **category picker** (lost email access · change email · merge accounts · password trouble · username conflict · connection trouble · collab dispute · delete account · other), each category swapping in a one-line hint; a "what happened" textarea; an **editable reply-email field** — prefilled from the session **but editable**, because the account address may be the broken one. A signed-in visitor sees a "Signed in as @handle" note; an anonymous visitor sees "No account needed."
- **Behaviors:** submit stamps the ticket with the member's `@handle` or "Anonymous visitor". **Replies go by email — there are no in-app support threads in v1.**
- **States:** default; submitting; **success** ("Got it — we're on it," replying to the given email); **error** (inline).

---

### 5.13 Auth — register, sign in, verify, reset, claim sheet

One minimal system for all roles: **register with email + password, verify the email once, then every login is one step with no email round-trip.** No username/handle ever appears in auth (email is the one private login identifier; the public handle is never a login). Auth must **never** appear on a shopping path.

- **`/join` — Register.** Content: a role-contextual heading (tuned by `?as=`), an email field, a password field with a show/hide toggle, the password rule shown up front (minimum length), a **Create account** button, and a line stating one verification email follows; plus a link to sign in. Behaviors: submit → a **"check your email"** state offering **resend** and **change email**. After the emailed link is used, route by role: Creator → Connect Socials (§5.15); Business → business basics; Shopper → back to the follow/comment they were attempting. States: default · submitting · check-your-email · email-already-registered (offer sign-in / forgot) · weak password (inline, live) · rate-limited.
- **`/signin` — Log in.** Content: a "welcome back" heading, email, password with show/hide, a **Sign in** button, and a secondary row (**Forgot password?** + **Create account**); honors `?callbackUrl`. States: default · submitting · **wrong email or password** (one generic message, never says which field) · **unverified email** (a *distinct* state offering resend) · rate-limited. The generic-failure and never-reveal-which-field rules are security requirements, not tone.
- **`/verify`.** Consumes the one-time verification token on load and forwards. States: success (auto-forward to the role's next step) · expired/used link (offer resend) · already verified (forward to sign-in). Opening the link on a different device verifies the account, then asks the user to sign in where they are.
- **`/forgot` + `/reset` — Password reset.** `/forgot`: an email field that **always** resolves to "check your email" (never an existence oracle; mail is sent only if the account exists). `/reset`: a new-password + confirm form reached from the emailed link; on success the user is signed in. `/reset` **doubles as the set-password screen for an invited Manager** who has no password yet — they land here from the invite link, set a password, and are verified and signed straight into the managed profile. States: link-sent · new-password form · expired link (offer a fresh one) · success.
- **Inline claim sheet (anonymous Follow / Comment).** When an anonymous shopper taps Follow or the "Sign in to comment" band, a **register-in-a-sheet** opens **over the current page** (email + password → "check your email" with resend, plus a Sign-in link inside) — it never navigates to `/signin`, never traps the shopper, and dismissing simply doesn't persist the action. **[LATER]:** the pending action doesn't auto-resume; the shopper re-taps after verifying.

---

### 5.14 Post hiding (in the tagging editor)

A creator can **Hide from page / Show on page** for any post (Admin **and** Managers). Hidden posts stay in the dashboard (with a "hidden" indicator), vanish from the public grid, and their public post URL returns 404. Hiding never deletes. The control's label toggles with a busy state while saving.

---

### 5.15 Connect Socials — Google (YouTube) & Meta (Instagram)

- **Purpose:** connect one Google (YouTube) and/or one Meta (Instagram) to the account. This unlocks profile creation **and** proves identity (you can only connect accounts you own — which is what makes a username un-squattable). It is **connect, not login** — there is no social login. Not required at sign-up; done when ready.
- **Where:** right after account creation, from the dashboard's "connect to create a profile" prompt, and in Settings.
- **Access:** Creator, **Admin only**.
- **Content in order:** a heading + the one-line requirement ("Connect at least one to create a profile"); a **Google (YouTube)** card with connection status + a Connect action; a **Meta (Instagram)** card, same shape; a one-line reassurance about why. A connected provider card shows the connected identity and the channels/handles it exposes (a Google account may expose several YouTube channels) — this pool later feeds username choice.
- **Actions:** **Connect** (an OAuth round-trip); **Re-authenticate** (recovery, always allowed); **Disconnect** (gated). Once ≥1 is connected → "Create a profile" is enabled.
- **States:** none connected · one connected · both connected · **loading** (the OAuth redirect out and back — show a clear returning/verifying state) · **error** (denied/cancelled/token error → friendly retry, never a dead end) · **env unconfigured** (an honest notice that connect isn't set up on this server yet) · **connected-but-token-unrefreshable** (empty channel list + a Reconnect action).
- **Edge cases:** **Disconnect is blocked** while any profile depends on the connection ("Delete the profiles using this connection first"); a provider returning multiple channels surfaces that choice during profile creation, not here.
- **Status today:** **Google/YouTube OAuth is built and credential-gated** (requests read-only YouTube access; lists channel title, handle, thumbnail, subscribers). **Meta/Instagram is [LATER]** — the card is designed and the UI says "Meta (Instagram) is coming next," but there's no Instagram gateway yet. (Instagram also appears as a manually-typed *link* in the socials row — unrelated to OAuth connect.)

---

### 5.16 Create Profile & Choose Username

- **Purpose:** turn a connected social identity into a shoppable **profile**. A profile gets a working page instantly (a random username) so the creator can proceed, then later claims their real handle **from the usernames they actually own** on the connected socials.
- **Access:** Creator, **Admin only**. Reached after connecting a social, and from the profile switcher's "New profile" (up to 5).
- **Rules (all enforced today):** creating a profile **requires ≥1 connected social** (else it's blocked, "Connect a Google or Meta account first"); an account holds **at most 5 profiles** (a conflict beyond that); a new profile is assigned a **random `creator-xxxxxxxx` username** and works immediately.
- **Intended two-step flow to design:** **Step A — create:** a heading with the "N of 5 used" cap, a "build from" identity selection (a connected YouTube channel and/or Instagram account), a Create button, and a line stating a temporary username is set and the real one comes next. **Step B — choose username:** a pick-list of **only** the handles the creator holds on the connected socials, each showing availability, the current random username, a live `plugfolio.com/{username}` preview, and Save. A handle already taken on Plugfolio shows unavailable ("first verified owner keeps it"); the creator stays on the random username until they pick a free one.
- **States:** default (create / picker) · loading (creating; checking availability) · **empty** (no connections → send to Connect Socials) · **error** (at the 5-profile cap — explain, offer to manage existing; save failure).
- **Status today:** the **rules** ship (needs a connection, max 5, random username). The **screens do not** — there is no create route, no "build from" selection, and no username picker yet ("picking a social-derived handle lands with the social APIs"). The only username *setting* that ships is admin-side dispute resolution (§6). So: **Step A + Step B, the handle-from-socials claim, and the availability preview are [LATER] to design and build.**
- **Out of scope:** free-form/vanity usernames, >5 profiles, custom domains.

---

### 5.17 Creator dashboard shell + profile switcher

- **Purpose:** the creator "back room" chrome every dashboard screen renders inside; screens never invent their own header.
- **Access:** the whole `/dashboard/*` tree is session-gated (unauthenticated → `/signin`). An "act as yourself" surface, never a shop path.
- **Content in order:** a brand mark → `/dashboard`; a **profile switcher** (see below); a **section-tab row** — **Home · Posts · Products · Categories · Collabs · Settings** (active by pathname; each carries the active `?profile=`; the row scrolls when narrow); then the page body. A page-header block gives each screen an optional eyebrow (usually the active `@username`, or the email on Home) over a title, plus an optional action.
- **Profile switcher:** a dropdown labeled with the active `@username`; a header line "Profiles · N of {max}"; one item per accessible profile (`@username`; managed profiles suffixed "· manager"; the active one marked). Switching stays on the current tab for tab-root routes, and falls back to Home from a detail route. A **New profile** item creates a profile immediately (random username) and is disabled at the 5-profile cap ("Profile limit reached") or while pending. The switcher is hidden entirely when the account has 0 profiles. A create error surfaces inline.

---

### 5.18 `/dashboard` — Home (+ Earnings)

- **Purpose:** the back-room home — the active profile, a nudge, profile chips, connection status, and the **Earnings summary** (Earnings has no separate route; it lives here).
- **Access:** Admin and Manager (both may view Earnings).
- **Content in order:**
  1. A page header (title "Dashboard", eyebrow = the signed-in email).
  2. **If 0 profiles** → an empty state "Create your first profile." whose copy branches on connection: connected → "Your account is connected — create a profile…" + a New-profile button; not connected → "Connect a Google or Meta account below, then create a profile…" (button hidden until connected).
  3. An **active-profile card** — avatar, `@username`, `plugfolio.com/{username}` (with "· you manage this profile" for a Manager), and a **View page** link.
  4. An **untagged-posts nudge** — shown when the active profile has ≥1 post with no products: "{N} post(s) have no products tagged → Tag them to make those posts shoppable →" deep-linking the Posts tab filtered to untagged.
  5. A **Profiles section** — heading + New-profile button + profile chips (active emphasized, managed badged "manager").
  6. A **social-connections** block.
  7. An **Earnings section** (only when an active profile exists) — heading "Earnings · @username" + the summary.
- **Earnings summary content:** a headline **total outbound taps** (labeled **tracked**); a **by-post** list (post caption, "Untitled post" fallback, with tap counts, most-tapped first); a **by-product** list (product titles + tap counts); a **code-copies** stat labeled "redemption not tracked" with per-product copy counts (an in-store-only product with copies but no taps still gets a row). Every number is **tracked** — there are deliberately **no "estimated" figures** (v1 has no affiliate-network conversion source).
- **States:** empty = an all-zero, encouraging summary ("Share your link to start seeing taps here"), not a sad zero; error → retry. History never shrinks: a post deleted after taps drops out of by-post but its taps remain in the total and by-product; deleting a product cascades its taps out of the projection.
- **[LATER]:** a dedicated Earnings route, a time-range selector (this week / month / all — today it's all-time), and "estimated" conversion figures (leave room beside the tracked numbers).

---

### 5.19 `/dashboard/posts` — Posts tab

- **Purpose:** every post as a grid with a tagged/untagged/hidden indicator; tap one to open the tagging editor. The entry point to making content shoppable.
- **Access:** Admin and Manager. No active profile → redirect to Home.
- **Content in order:** a header (title "Posts", eyebrow `@username`, an **Add post** action); a filter (**All / Tagged / Untagged**, carried in `?filter=`); a thumbnail grid. Each tile → the editor; overlays: a **"hidden"** indicator when hidden, and either a **product-count** indicator (tagged) or an **"untagged"** indicator.
- **Add a post:** opens a dialog (keeps the grid a grid) — a **media URL** + optional **caption** + Add. Manual entry is the **interim content source**; auto-import from connected socials is [LATER] ("Auto-import from your socials lands with the social APIs").
- **States:** empty (no posts) → "No posts yet / Add your first post — then tag products onto it to make it shoppable."; empty (filter matches nothing) → "Nothing here / No posts match this filter."
- **[LATER]:** automatic post import + a re-sync affordance (no import yet; manual add is the interim).

---

### 5.20 `/dashboard/posts/[postId]` — Tagging editor (the core tool)

- **Purpose:** a focused workspace showing the post, what's tagged on it, and a paste-a-URL form. **Publish-free** — tags go live as they're added.
- **Access:** Admin and Manager; another profile's post 404s here.
- **Content in order:**
  1. A **back to Posts** link; a **Hide / Show on page** control (§5.14) and a **View as visitor** link (opens the public post URL).
  2. When hidden, a line: "Hidden from your public page — visitors can't see this post until you show it again."
  3. The post media + caption, and a **category select** for the post ("None" default).
  4. A **Tagged products** section — a heading with count; empty copy "Nothing tagged yet — paste a product URL below and this post becomes shoppable."; otherwise a list of product rows (the same rows as the Products tab).
  5. A **Tag a product** form.
- **Tag form:** a **Product URL** (required; helper "We grab the title, image & price" — an unreadable page falls back to titling the product by its hostname, silently, never an error); a **kind toggle** (**Affiliate product / My own product**, default affiliate — the link field relabels "Your affiliate link" vs "Your store / product link"); an **Add a coupon** collapsible (code, optional "valid till" date, optional in-store note). **Channel rule** (enforced client-side and at the boundary): a product needs a link, or a coupon-code-with-in-store-note, or both — a code-less product accepts no taps/copies. Submit is gated on a URL + a valid channel; busy label "Tagging…"; on success the new product appears above (make this the celebratory "my post is now shoppable" moment); errors inline.
- **[LATER]:** editing a product's title here (hostname fallback only for now).

---

### 5.21 `/dashboard/products` — Products tab

- **Purpose:** the profile's product library — a list you scan, not a CRM. See everything tagged, fix a bad link, edit a coupon, or remove a product; changes propagate to every post using it.
- **Access:** Admin and Manager. No active profile → redirect to Home.
- **Content in order:** a header (title "Products", eyebrow `@username`); a **search** field (present only when products exist; a plain form on `?q=`, case-insensitive title match); product rows. Each row shows the image (or a fallback), title, price, a **kind marker** for own products, a **coupon** summary, an **"in N posts"** count ("not on any post" when its post was deleted), an inline **fix-link** (Save), an inline **coupon editor** (clearing the code removes the whole coupon), a **Remove**, and a **category select**.
- **States:** empty → "No products yet / Tag a product on a post to see it here…"; search-miss → "Nothing matches …"; save/remove error → retry. Removing a product also removes its recorded taps from the projection — consider a confirm.
- **[LATER]:** a broken/dead-link flag (needs a link-checker job — today every link is editable but none is flagged).

---

### 5.22 `/dashboard/categories` — Manage categories ("shelves")

- **Purpose:** group a profile's posts and products into categories (each a **title** + optional **description**, e.g. "Desk setup"). Categories belong to one profile — there is **no site-wide taxonomy**; a post or product sits in **one category or none**.
- **Access:** Admin **and** Managers (same tier as tagging).
- **Content:** the profile's categories in display order, with **add** (title required, description optional), **rename**, **reorder**, and **delete**. Delete confirms "Posts and products stay — they'll show under All." (deleting a category never deletes content).
- **Assigning** happens via the category select in the tagging editor and on product rows — never required before publishing.
- **States:** empty ("Group your posts and products into shelves" + an add call to action); duplicate-title inline error (one title per profile); delete confirm.
- **Shopper side** is the category-chips filter on the creator page (§5.4).

---

### 5.23 `/dashboard/settings` — Profile Settings & Managers

- **Purpose:** where an **Admin** manages one profile's public identity, links, connections, and the people who help run it. The Admin-vs-Manager boundary must be obvious — Admin-only controls are **shown and explained**, never silently hidden.
- **Access:** the Settings tab shows for **both** roles; **Manager = picture control only.** A Manager hitting an Admin-only API is refused (403).
- **Content in order:**
  1. A header (title "Settings", eyebrow `@username`, a **View page** action).
  2. A **Public profile** card (all roles see it): a note that the page lives at `plugfolio.com/{username}` and the username is read-only for now; a **picture** field (upload a photo per ADR-0023, or paste an image URL) with an avatar preview — **Managers may edit this**; a **name** field and a **bio** field — **Admin only** (labeled "· Admin only", disabled for Managers); one **Save profile** button. A Manager's save carries only the picture; the server rejects name/bio in a Manager payload.
  3. An **Admin-only region** (for a Manager, replaced by: "Links, connections and Managers are Admin-only — you manage this profile's content, and can change its picture above."):
     - **Your links** — five labeled URL fields (Instagram, YouTube, TikTok, Facebook, Website) feeding the public socials row; a single **replace-all** Save (empty fields clear that link, "Empty fields are removed on save.").
     - **Connections** — the socials this account owns; Disconnect is gated (blocked until a depended-on profile is deleted).
     - **Managers** — "Managers · N of 3", the explainer "Up to 3 people who can post and tag on this profile. Settings and connections stay yours."; a list of Managers (name/email) each with a **Remove**; an **invite-by-email** field + **Invite**. Invite finds-or-creates a user by email (their next sign-in picks up membership — no separate acceptance flow; a passwordless invitee is mailed a set-password link). Removal is immediate (confirm: "Remove {name}? They lose access immediately."). At the cap of 3 the invite disables ("This profile has all 3 Managers — remove one to invite another."). Errors (already-added, self-invite, cap) inline. Empty: "No Managers yet — invite up to 3 people to help post."
     - **Danger zone** — **Delete profile** (Admin only): confirm "Delete @{username}? The page, its posts, products and earnings history disappear. This can't be undone." Cascades the profile's content, frees a profile slot, and redirects to the dashboard.
- **[LATER]:** an editable **username** (read-only today; picking/renaming from connected handles lands with the social APIs); **picture upload** (paste-a-URL only today); connected-social auto-fill + drag-reorder for the links row.

---

### 5.24 Business surface & collab threads

**Two doors to a creator.** Door one: a business posts a **requirement** to an open board; creators **approach** it. Door two: a business browses a creator's public page and **requests a collab** directly. Both converge on one shared **thread**. One business per account. **v1 handles no money** — "budget"/"price" are free-text; the thread's job ends at **agreed terms**; payment settles off-platform.

#### `/collabs` — Business home
- **Access:** signed-in; a light chrome (brand → home + Sign out).
- **State A — no business yet:** an eyebrow "Business", heading "Create your business", subcopy "A name and what you sell — that's the whole sign-up.", and a **create-business form** — **Business name** (required), **What do you sell?** (required), **Logo URL (optional)**. Submit "Create business / Creating…"; error inline.
- **State B — business exists:**
  1. A **business identity header** — logo (or a fallback), name, description.
  2. A **Threads** section — thread cards showing the counterparty as `@creator` with an **Agreed / Negotiating** badge; empty: "No threads yet — Post a requirement below and creators will approach you — or browse creator pages and reach out first." + a **Browse creators** action → `/explore`.
  3. A **Your requirements** section — a card per requirement (title; a **Close** action while open, or a "Closed" badge; a row with an optional budget, optional deadline, and the **approach count** — "no approaches yet" / "{n} approached"; the brief body); empty: "Nothing posted yet — creators who fit can approach the moment you post one." Always below: a **Post a requirement** card containing the requirement form.
  4. A **Find creators** section — a card with an **Explore** action → `/explore` (there is no bespoke browse screen; vetting = viewing a creator's public page).
- **Requirement form:** **What do you need?** (title, required), **The brief** (required), **Budget (optional)** (free text — never a currency-validated field), **Deadline (optional)** (a date). Submit clears the fields; error inline.
- **Closing a requirement:** confirm "Close this requirement? It leaves the open board; existing threads continue." A closed requirement is off the board and can't be approached (approaching one is refused); existing threads persist.

#### `/dashboard/collabs` — Creator's Collabs tab
- **Access:** Admin and Manager, inside the dashboard shell.
- **Content:** a **Your threads** list (counterparty shown as the business name + Agreed/Negotiating badge; empty "No collabs yet.") and an **Open requirements** board (each requirement: title, business, optional budget, optional deadline, the brief, and an **Approach** composer that approaches as the active profile). With no profile, the board is read-only ("Create a profile to approach requirements.").
- **Approach composer:** a single opener input + **Approach** ("Sending…"). Success clears it and a new thread appears under Your threads. A duplicate approach lands in the existing thread rather than opening a second (and a just-closed requirement surfaces its refusal here).
- **[LATER]:** distinguishing incoming vs approached, a "new" badge, and a decline/archive action.

#### `/collabs/[collabId]` — Collab thread (shared by both roles)
- **Access:** signed-in; **non-participants get a 404** (the thread must not exist for them). The viewer's side (business/creator) is resolved server-side and drives role-specific rendering and the back link.
- **Content in order:**
  1. A back link (to `/collabs` or `/dashboard/collabs` by side).
  2. A **terms card** (pinned): title "{business} × @{username}"; a subtitle = the requirement title, or "Direct collab" when there's no linked requirement; an **Agreed / Negotiating** badge; the **live terms** line ("The terms · {content · price · by date}"), or a placeholder "No terms proposed yet — pin what gets made, the price, and the deadline below."
  3. An **Agreed banner** (only when both accepted): "Both sides accepted — payment settles off-platform."
  4. A **message list** (oldest-first; each message attributed to the business name or `@username`, with a timestamp, aligned by whether it's the viewer's own).
  5. **Thread actions** + **Propose terms**.
- **Thread actions:** a **message composer** (a single input + send; empty rejected); an **accept row** — a left status line ("The other side has accepted." / "…hasn't accepted yet.") and a right button that reads **Accept terms** or, once you've accepted, "You accepted" (disabled). Send/accept errors share one inline alert.
- **Propose terms** (either side): a collapsible with **What gets made** (required), **Price (optional)**, **Deadline (optional)**, and the warning "A new proposal resets both acceptances." A new proposal becomes the pinned live terms and **clears both acceptances** — so "Agreed" always means agreed to *these* terms.
- **Agreed state:** once both sides accept the current terms → the badge flips to **Agreed** and the banner appears. Any later proposal returns it to Negotiating.

#### Request collab from a creator page (door two)
- **Where:** on a creator's public page, for a viewer who **owns a business and is not a member of the page** (§5.4). Anonymous, non-business, and the page owner don't see it.
- **Content:** an eyebrow "You own a business", a single-line message input, and a **Request collab** button.
- **Behavior:** on success the form is replaced by "Request sent — check your Collabs." and the page refreshes. A duplicate request lands in the existing thread. The created thread shows as "Direct collab".

---

### 5.25 System screens

| Screen | Spec |
|---|---|
| **404** | "This page doesn't exist." + a link home. Also used for unknown/hidden/foreign handles, posts, products, and threads (existence is never revealed to non-participants). |
| **Error boundary** | A friendly "something went wrong" + a **Try again** affordance. No stack traces. |
| **Loading** | Server-rendered surfaces mostly render whole; where a loading state is needed, prefer content-shaped placeholders over spinners. (Shopper-surface skeletons are largely [LATER].) |
| **Redirects** | Every gated page bounces to sign-in with no flash of protected content. |

---

## 6. The internal admin console (`apps/admin`)

A separate deployable — a third app, not part of the shopper/creator/business web app — where a small set of trusted operators moderate people and content, settle username disputes, flip runtime settings without a deploy, and read platform analytics. Not a public surface (no indexing, nothing links to it). **Design it desktop-first and information-dense — a tool, not a shop** — but, as everywhere in this document, the *visual* system is yours.

- **Identity model:** operators are a **separate account type**, never the product user table, so a product-auth bug can't reach admin. Sign-in is email + password only. **One role in v1** — every operator sees everything. **No self-service sign-up, reset, or SSO** — operators are seeded via CLI or invited from the Admins screen (invitees set a password via a link). **Auth hardening:** short session lifetime (one working day), a login rate-limit that returns the same generic failure whether or not an account exists (no existence oracle), and revocable sessions (a password change/reset or an operator removal invalidates outstanding sessions). Every mutation is written to an append-only **audit log**; destructive deletes record a snippet of what was removed.
- **Global chrome:** a persistent sidebar grouped **People** (Members · Profiles) · **Content** (Posts · Products · Comments · Reports) · **Marketplace** (Businesses · Requirements · Collabs) · **Insight** (Analytics) · **System** (Admins · Settings · Audit log), plus a top bar with the page title and a theme toggle. Shared list-screen pattern: a header with search, an optional filter row, a dense table, and pagination (numbered on most lists; **load-more** on Comments so page numbers don't shift under an incoming stream). Destructive actions use a confirm dialog naming the action and its consequence (and, for suspend, requiring a **reason**); some (release/reset username) use a confirm-with-one-input. Success/failure feedback is a toast naming the target. Every list has loading / empty / error states. Bulk-select (with a count-naming confirm) exists on Members, Posts, Products, and Comments. CSV export exists across the list screens.

**Screen inventory (each: purpose · content · actions & effects):**

- **Sign in** — the only door; a generic "Wrong email or password." on failure; no sign-up/reset/SSO links.
- **Dashboard** — stat tiles (members, profiles, businesses, posts, products, taps·7d, code-copies·7d, comments·7d, **open reports**), each linking to its section, plus a **recent-activity** module (latest audit entries + a link to the log).
- **Members** — find any account (by email / @handle / name); columns for identity, handle, roles, status (Active / Unverified / Suspended), joined date. Actions: **Suspend ↔ Unsuspend** (suspend needs a reason; blocks login and hides the member's profiles; reversible, nothing deleted). Status filter, numbered pagination, bulk suspend, CSV.
- **Member detail** — everything about one account before acting: profiles owned/managed, connected socials (read-only), business, recent comments, follows, meta. Header actions: **Resend verification** (when unverified), **Send password reset**, **Reset @handle** (a confirm-with-input onto a suggested random handle), **Suspend / Unsuspend** (with reason), and **Delete account** (a type-to-confirm heavy action: profiles/posts/products/comments/follows deleted; taps survive as anonymous events).
- **Profiles** — the creator-page registry (search by username / owner email); status Live / Suspended / Owner-suspended. Actions: **Suspend ↔ Unsuspend** (darkens just this page; the owner still signs in), and **Release username** (a confirm-with-input that frees the current name for its rightful owner and renames the page to a random handle — the lever for impersonation/squatting/disputes; the page stays live at the new address, nothing deleted).
- **Profile detail** — inspect a page before acting: newest posts, products (with kind, coupon, taps·30d, per-row Remove / Clear coupon), managers, categories, and a stats band. Header: View public page, Release username, Suspend/Unsuspend.
- **Posts** — takedowns for stolen/illegal media (search by caption / profile; "View media" opens it, no inline thumbnails). Action: **Remove** (tagged products stay; recorded taps survive). Bulk remove.
- **Products** — takedowns for counterfeit/prohibited links and stale-coupon sweeps (search by title / profile; columns for kind and coupon, with an "Expired" marker). Actions: **Clear coupon**, **Remove** (removes the product and its recorded taps). Coupon filter, bulk remove.
- **Comments** — a newest-first moderation stream (search by text / author / page). The **By** column makes the identity rule scannable: a personal author as `@handle`, a brand-voiced comment as a profile badge (the self-promo signal). Action: **Delete** (replies cascade). **Load-more** (not numbered pages). Bulk delete.
- **Reports** — the triage queue (oldest-open-first): the reported target (type + snippet), the reason (category + note), the reporter (`@handle` or "Anonymous shopper"), age, status (Open / Resolved / Dismissed). Actions: **View target**, **Resolve**, **Dismiss** (both audited). Fed by the account-free product-side report flow (§5.11). Status filter defaults to Open.
- **Businesses** — oversight of brand accounts (search by name / description / owner). Action: **Clear logo** (account-level abuse routes to Members).
- **Requirements** — the open collab board (search by title / brief / business), with an approach count. Action: **Remove** (comes off the board; existing threads survive).
- **Collabs** — **read-only** thread oversight ("a bad actor in a thread is handled by suspending the member") — no row actions; columns for the pairing, source (requirement or "Direct reach-out"), message count, state, started date.
- **Collab thread reader** — read a reported negotiation: the full transcript (oldest-first, sender + role tag, timestamps), the terms/agreement timestamps, and a per-message **Delete message** (audited). **No composer** — admins never write into threads.
- **Analytics** — a platform read of the one number that matters: taps and code-copies over 7/30 days, top profiles and top products (30d), a tap-sources breakdown, and a per-day trend of taps. Read-only.
- **Settings** — runtime config, two cards: **Reserved usernames** (a baseline, code-provided set shown as non-removable, plus admin-managed additions) and **Feature flags** (a small table to toggle/remove flags; empty = "everything runs on defaults"). **Real flag readers today:** `comments` (kills the composer + comment POST), `reports` (gates report inflow), `support` (gates the support inflow) — all default on.
- **Admins** — manage operators without the CLI: add/invite (an invite email sets the password via a link), reset a password (invalidates that operator's sessions), remove (can't remove yourself or the last operator), and change your own password.
- **Audit log** — the append-only trail (when · admin · action · target · detail), read-only, with a filter row and CSV export.

*(Full admin briefs: `admin-console.md` + `admin-console-m2.md`. Milestone 2 — detail pages, the collab reader, the reports queue, the Admins screen, toasts, filters, CSV, bulk-select, and the analytics trend — is shipped.)*

---

## 7. Emails as content assets

Auth links are one-time, time-limited (24h), and single-use. Real mail is sent via an HTTP mail API (env-gated, with a console fallback in dev); send failures are loud, because these links are the account lifeline. Three shopper/creator email assets need copy (a fourth flow — operator invites/resets — belongs to the admin app):

1. **Verification email** — sent once at registration; carries the one-time link to `/verify`. The account can't sign in until it's clicked.
2. **Password-reset email** — sent from `/forgot` (only when the account exists; the page never reveals which); lands on `/reset`.
3. **Manager set-password invite email** — sent when inviting a Manager who has no password yet; carries a reset-style link to `/reset` that doubles as the first-password screen and verifies the email. Not sent to invitees who already have a password.

Each needs: the tokenized link, a sender identity, a short purpose line, and expiry/one-time language. (The old "magic-link sign-in email" is obsolete — login no longer uses email.)

---

## 8. Component inventory (current grammar)

Built on **shadcn/ui**; look and theming are yours. In use today: **Button** (with a disabled/busy label pattern), **Card**, **Skeleton**, **Input / Textarea / Select** (label + inline error + helper), **Dialog** (add-post, confirms, report, claim sheet), **Sheet** (the inline claim sheet), **DropdownMenu** (the profile switcher), **Avatar**, **Badge / status chips** (Agreed / Negotiating, "· manager", the Creator badge, coupon and kind markers), **Tabs / a bottom tab bar / a top bar** (the shopper chrome), **Table** (admin), and **Toast** (admin feedback). Product-specific pieces: the copy-code button, the report button, the category chips/select, the tagging form, and the collab terms card. Flag any new primitive a screen needs.

---

## 9. Copy & tone

Plain, confident, creator-native; the product's personality is *removing* friction. Say the quiet parts loudly: "shopping never needs an account," "tracked," "redemption not tracked," "payment settles off-platform." Errors are specific and human ("A profile has at most 3 Managers"), never codes, and auth/admin failures stay deliberately generic where that's a security requirement. You may rewrite wording freely as long as the meaning and the honesty labels survive.

---

## 10. Explicitly OUT of v1 (do not design these in)

On-platform payments / payouts / checkout / cart / totals · referral or share-to-earn rewards · anonymous wishlists & price alerts · an aggregated "My Creators" feed · tracked in-store redemption / QR (the *untracked* in-store coupon channel IS in v1) · star ratings & an "actually uses this" badge · media kits & campaign suites · drops / bundles / availability windows · TikTok connect · AI tag suggestions · >5 profiles, >3 managers, or finer roles · vanity/free-form usernames · creator-to-creator collabs · in-app support threads (support replies go by email). *(Full rationale: `plugfolio-lean-journey.md`.)*

---

## 11. [LATER] ledger — designed-for, not yet live

Design these now where noted; they're built behind a credential/data gap or deferred:

- **Meta/Instagram connect** — designed, not built (Google/YouTube OAuth is built and credential-gated).
- **Creator username picker** from connected handles — rules ship (needs a connection, max 5, random username), but Create-Profile Step A/B and the availability preview are not built; profiles keep a random username until then.
- **Automatic post import + re-sync** from connected socials — manual media-URL entry is the interim.
- **Video / reels playback** and a "watch on the platform" tap-out — posts render as static media today.
- **Claim-sheet auto-resume** — a pending Follow/Comment doesn't auto-complete after verify; the user re-taps.
- **Dead/broken-affiliate-link** shopper state + a Products-tab link-health flag — needs a checker job.
- **Product title editing** in the tagging editor (hostname fallback only today).
- **Picture upload** (paste-a-URL only today); connected-social auto-fill + drag-reorder for the links row; disconnect flows once live OAuth exists.
- **A dedicated Earnings route, a time-range selector, and "estimated" figures** (leave room beside the tracked taps and code-copies).
- **Explore filters** (region / following-size / verified), niche chips, trending sort, pagination.
- **Report affordance on the post view** (backend supports a post target; no UI wired).
- **Collabs incoming-vs-approached distinction, a "new" badge, and decline/archive.**
- Shopper-surface **loading skeletons** throughout.

---

## 12. Open questions for you

1. Empty-state art — illustrated, typographic, or minimal?
2. The "Agreed" settled state in threads — badge, banner, or timeline event?
3. How the post collection reads on desktop vs mobile.
4. The comment identity picker — inline control, sheet, or menu — and how the Creator-badge treatment reads against a person's `@handle`.
5. Light-first or dark-first as the default public appearance (both must exist).

*Companion sources if you want more depth per page: `docs/design/00-foundations.md`, the per-page briefs 01–13 in this folder (now consolidated here), the admin briefs, the change briefs, `docs/implementation/*`, and product scope in `plugfolio-lean-journey.md`. Where any of those and this document disagree, this document reflects what actually ships.*
