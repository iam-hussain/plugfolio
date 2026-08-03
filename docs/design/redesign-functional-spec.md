# Plugfolio — Complete Functional Specification for the Redesign

*For the designer, and for the engineer who builds what the designer draws.*
*Every page, every feature, every role, every state, every flow. Nothing omitted.*

---

## 0. How to read this document

This document says **what the product does**. It does not say what it should look like.

**Fixed — do not change without a product decision:**
- The features listed here, and the rules marked **Rule**.
- What each role is allowed to do.
- What information a screen must carry.
- The promises the product makes (no account to shop, no money handled, no invented numbers).

**Yours to decide — completely:**
- Layout, grid, colour, type, spacing, imagery, motion, density, tone of voice.
- **Navigation architecture.** Which items live in a top bar, a bottom bar, a side rail, a
  drawer, a menu, a search field, or nowhere at all. Current placement is described only so
  you know what exists — treat it as inventory, not instruction.
- **Page names and labels.** Every name in this document is the current name. Rename freely
  (§14 lists them all in one place so you can rename knowingly).
- **Merging and splitting screens.** If two screens should be one, or one should be three,
  propose it. If a feature belongs on a different screen, move it.
- **Where a feature is exposed.** A control listed under one screen may live somewhere better.
- **Which states get their own screen** versus an inline treatment.
- **The creator's page-customisation options** (§11) — how many, how they're chosen, how they
  preview. The *set* of what is customisable is fixed; everything about presenting it is yours.

**Two words used precisely throughout:**
- **Must** — the product breaks or lies without it.
- **Available** — it exists; you decide whether, where and how it surfaces.

---

## 1. The product in one page

> A creator turns their content into a page where every post is shoppable.
> A follower taps a post and buys. No account, no friction.

**The core loop:** creator tags products onto their posts → shopper arrives from a bio link →
taps a post → sees the product → taps out to the retailer → the retailer's affiliate network
pays the creator directly.

**Four rules that shape every screen:**

1. **An account is never the price of shopping.** No sign-in wall may ever appear on a path
   that ends in a Buy. An account is required only for: follow, save, comment, react to a
   comment, sell (creator), hire (business).
2. **The product handles no money.** No cart, no checkout, no wallet, no payouts, no prices
   paid to Plugfolio. Every Buy hands the shopper to a retailer. Collab payment happens
   off-platform.
3. **No invented numbers.** Every figure shown is a directly measured event. There is no
   "estimated" anything. Where Plugfolio cannot see something (coupon redemption at a till),
   the screen says so.
4. **Most traffic arrives inside Instagram's or TikTok's in-app browser** on a phone. Anything
   that needs a second tab, a popup, a file download or a slow first paint is a design failure.

**Three roles:** Shopper · Creator · Business. Plus **Operator** (internal staff, separate app).

---

## 2. Vocabulary — get these distinctions right or the UI will lie

| Term | What it is | Where it appears |
|---|---|---|
| **Account** | The login. Email + password. One person, one account. | Everywhere |
| **Member handle** (`@handle`) | Every account has one, globally unique, auto-generated at sign-up, changeable in settings. **Display-only** — it is how you appear when you follow or comment. It has no public page. It is also accepted as a login. | Comments, follow lists, account settings |
| **Profile** | One shoppable creator page. An account holds **up to 5**. | Creator pages, dashboard |
| **Profile username** | The public URL segment (`plugfolio.com/<username>`). Drawn **only** from a connected YouTube/Instagram handle. **Never a login.** | Creator page URL, everywhere the page is linked |
| **Post** | A piece of the creator's content (still image, or a video/reel). Imported from a connected social, or created manually. | Creator page, post view, dashboard |
| **Product / "thing"** | An outbound card: a name, image, price, and a link out. Lives in its own library — **not owned by a post**. | Product page, post view, dashboard |
| **Tag / connect** | Attaching an existing product to a post. Copies nothing. One product may sit on many posts, or none. | Post editor, post view |
| **Category / shelf** | A creator-defined grouping. Belongs to that profile only — not a site-wide taxonomy. | Creator page filter, dashboard |
| **Tap** | A shopper leaving for a retailer. The one thing the product measures on the buy path. | Traffic |
| **View** | A page, post or product page opening. | Traffic |
| **Watchlist / "Saved"** | Bookmarked posts and products. A shelf, not a cart. | Saved screen |
| **Requirement** | A brief a business posts to an open board. | Collabs |
| **Collab thread** | The one conversation where a creator and a business agree content, price and deadline. | Collabs |

---

## 3. Roles and permissions — the complete matrix

### 3.1 What each role can do

| Action | Visitor (no account) | Shopper | Creator | Business | Operator |
|---|---|---|---|---|---|
| Browse any public page | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search / Explore | ✅ | ✅ | ✅ | ✅ | ✅ |
| Open a post, open a product | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tap out to a retailer (buy)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Copy a coupon code | ✅ | ✅ | ✅ | ✅ | ✅ |
| Share anything | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Report** a comment / product / page | ✅ | ✅ | ✅ | ✅ | ✅ |
| Follow a creator | ❌ | ✅ | ✅ | ✅ | — |
| Save to the watchlist | ❌ | ✅ | ✅ | ✅ | — |
| Comment / reply | ❌ | ✅ | ✅ | ✅ | — |
| Mark a comment helpful / not helpful | ❌ | ✅ | ✅ | ✅ | — |
| Own a shoppable profile | ❌ | ❌ | ✅ | ❌ | — |
| Post a requirement, approach a creator | ❌ | ❌ | ❌ | ✅ | — |
| Receive a collab request | ❌ | ❌ | ✅ | — | — |
| Moderate, settle disputes, flip settings | ❌ | ❌ | ❌ | ❌ | ✅ |

**Rule:** every row marked ✅ for *Visitor* must work with no account and no interruption.

### 3.2 Roles *within* a creator profile

Every profile has exactly **one Admin** (the account that created it) and **up to 3 Managers**
(invited to help run that one profile).

| Can they… | Admin | Manager |
|---|---|---|
| Connect/disconnect Google or Meta | ✅ | ❌ |
| Create or delete a profile | ✅ | ❌ |
| Edit profile name, username, appearance, links, settings | ✅ | ❌ |
| Invite or remove Managers | ✅ | ❌ |
| Post content, edit posts, tag products | ✅ | ✅ |
| Create and edit products, coupons | ✅ | ✅ |
| Curate categories | ✅ | ✅ |
| Change the profile picture | ✅ | ✅ |
| Read Traffic | ✅ | ✅ |
| Handle collabs | ✅ | ✅ |

**A Manager must never be shown a control they cannot use.** Hide it or state plainly why
it is unavailable — do not present a dead button.

### 3.3 One person can be several things at once

A single account may be a shopper *and* a creator *and* a business. The product must let
someone move between those contexts without signing out. How that context switch is
presented is yours to design.

---

## 4. Identity & authentication — every screen, stage by stage

All three roles register the same way: **email + password**. The role a person declares
changes only the wording and where they land afterwards — the form itself is identical.

### 4.1 Screens that exist

| Current route | Current name | Purpose |
|---|---|---|
| `/join` | Join / Create account | Declare a role, then register |
| `/verify` | Verify | Confirm the email **and pick a username** |
| `/signin` | Sign in | Email **or** member handle + password |
| `/forgot` | Forgot password | Request a reset email |
| `/reset` | Reset password | Set a new password from an email link |

**These are the only screens in the product that carry no site chrome** — a person here is
mid-task and the way out is the brand mark. Whether you keep that convention is your call,
but the intent is: don't offer twelve exits to someone filling in two fields.

### 4.2 Registration — stage by stage

1. **Declare a role.** Creator, Shopper or Business. This is a genuine fork in the copy and in
   what happens at the end; it is **not** a permission boundary (an account can become anything
   later).
   - Creator promise: your posts become a shop.
   - Shopper promise: an account is only for following and commenting — buying never asks.
   - Business promise: brief it once, hear from creators.
2. **Register.** Email + password. Nothing else. A member `@handle` is generated automatically
   so sign-up stays one step.
3. **One verification email is sent.** It carries **two** ways to prove the address:
   - a **link**, and
   - a **six-digit code** to type on the verify screen.
   **Why both:** in-app browsers routinely lose the tab when someone leaves for their mail app.
   The code is the recovery path and must be at least as prominent as the link.
4. **Verify — and pick a username here.** Verification is also where the account **chooses its
   username**. It is never assigned. Needs: availability feedback, rules, and a graceful
   "that one's taken" path.
5. **Land somewhere useful, by role.**
   - Creator → connect a social so the handle can't be claimed by someone else.
   - Shopper → back to whatever they were doing.
   - Business → set up the business name and what they sell.

**States to cover:** email already registered · weak/short password · verification email not
arrived (resend, with a cool-down) · link expired · code wrong · code expired · username taken ·
username invalid · already verified · verifying on a different device from the one that registered.

### 4.3 Sign in

- Accepts **email or member handle**, plus password.
- **Rule:** no magic-link-only login. The round-trip to a mail app is the single thing in-app
  browsers are worst at. A password login must always be available.
- States: wrong credentials (never reveal which field was wrong) · unverified account · locked/
  rate-limited · already signed in · "continue where you left off" after a gated action.

### 4.4 Password reset

Forgot → email → reset link → set new password → signed in. States: unknown email (must not
confirm whether an account exists) · expired link · used link · new password rejected.

### 4.5 Connecting socials (creator only)

- After the account exists, the **Admin** connects **one Google (YouTube)** and **one Meta
  (Instagram)**. Not required at sign-up.
- **At least one connection is required to create a profile.** Because you can only connect
  accounts you own, connecting doubles as proof of identity behind a username.
- An Admin can **re-authenticate** a connection any time (recovery), but **cannot fully
  disconnect** a provider while a profile still depends on it — the profile must be deleted first.
- States: not connected · connected · expired/needs re-auth · provider returned nothing usable ·
  the account has no eligible handles · connection already used by another Plugfolio account.

### 4.6 Creating a profile and choosing the public username

1. From the connected channels/handles, spin up a profile (**max 5 per account**).
2. Posts import automatically.
3. A **random username is assigned immediately** so the page works from the first second.
4. In profile settings, the Admin picks the real username **from the handles they actually own
   on the connected YouTube/Instagram** — nothing else is offered. No follower minimum, no
   approval step.
5. **If a handle is already taken on Plugfolio, the first verified owner keeps it**; the newcomer
   stays on the random username until they pick a free one. Design a dignified version of this —
   it is a genuinely disappointing moment.

---

## 5. Global chrome — what must be reachable

Described as inventory. **Where any of it lives is entirely your decision** — top bar, bottom
bar, rail, drawer, menu, search, or a new idea.

**Currently on every public/shopper screen:**
- Brand mark. Links to the discovery surface when signed in, to the marketing landing when
  signed out.
- Global search entry point.
- Explore · Following · Saved.
- Account entry point (or a sign-in affordance when signed out).
- A site footer with: shop links, creator links, business links, company/legal/support links.

**Currently on creator screens:** a profile switcher (which of your up-to-5 profiles you are
editing), a link to view the live public page, and the dashboard's own sections.

**Currently on business screens:** the collabs surface and the business identity.

**Constraints that survive any navigation you design:**
- A shopper must reach **Explore**, **Following**, **Saved** and their **account** without
  hunting.
- On any post or product page, **who the creator is** and **the way back to their page** must
  be present. (Today this is a bar that appears once the creator's name scrolls out of view,
  plus a back link.)
- Auth screens are deliberately chrome-free.

---

## 6. Public & shopper surfaces

### 6.1 Landing (`/`) — marketing

**Job:** explain the product to someone who has never seen it, and send them into Explore or
into creator sign-up.

**Content that exists today (all of it re-writable, none of it sacred):**
- The promise: no account needed to shop.
- The headline idea: one link carries the creator's whole shoppable output.
- The three-step explanation: find a creator → tap any post → buy at the retailer.
- The negative promise, stated plainly: no cart, no checkout, no wallet; Plugfolio never sees
  your card; the creator is credited by the retailer's own network; we only measure the tap.
- Three role entrances: shop · create · brands.
- Live examples — real creator pages and real shoppable posts.
- A creator-focused close: connect a social, posts import themselves, tag, publish, one link in
  your bio.

**Rule:** every claim on this page must be true of the shipped product. It carries structured
data (FAQ, organisation, sitelinks search) that mirrors the visible copy — if the copy changes,
that changes with it.

**States:** signed out (default) · signed in (the account slot reflects the session) · no live
creators yet.

### 6.2 How it works · For creators · For business · Support

Four marketing/help routes exist today. They can be merged, split, renamed or restructured.

- **How it works** — the loop explained at more length than the landing does.
- **For creators** — the creator pitch, the five-minute promise, what connecting does.
- **For business** — the two doors (post a brief · approach a creator), and that payment is
  off-platform.
- **Support** — a contact form. Covers: account trouble, a lost verification email, account
  merges, username disputes, and anything else. Submissions land in the internal operator queue.
  **Available to people with no account** (someone locked out cannot sign in to ask for help).
  States: form · sending · sent (with what happens next and how long) · send failed.

### 6.3 Explore (`/explore`) — discovery

**Job:** find creators, posts and things. Fully usable with no account.

**Content:**
- A **search** field. One query searches post captions, creator handles and the things tagged
  in them. Max 80 characters. Search is a plain page load — it must work with no JavaScript and
  survive an in-app browser.
- **Four scopes:** All · Creators · Posts · Products. On *All*, each section is a teaser with a
  way to see the full set; on a specific scope, that section is the whole result.
- A **result count** that describes what is actually on screen. It must never count something
  the visitor didn't ask to see.
- **Creators** — each carrying their name/handle, a representative image, and how many things
  they have tagged.
- **Posts** — each carrying the creator, the caption, the number of things tagged, at least one
  tagged product with its price, and an indication when more are tagged than are shown.
- **Products/things** — each carrying the creator, the name, the price, whether it is the
  creator's own product, and the coupon code when a live offer exists.
- **One sponsored slot** (see §10.7).
- **An end-of-wall statement.** A list that simply stops reads as a list that broke. The wall
  must say which end it reached: either "that's everything for now" or "showing the first N —
  search to narrow it down". Results are capped per read; there is no page-by-page paging yet.

**States:** results · results for a query · **no results for a query** (offer to widen or clear
it, and explain what search actually looks at) · **nothing on the platform yet** (this is the
only screen in the product where there is genuinely nothing to shop — it doubles as an
invitation to claim a handle) · a scope with zero results while others have some.

### 6.4 Creator profile page (`/<username>`) — **the most important screen in the product**

**Job:** a shopper arrives here from a bio link and must immediately understand who this is and
that everything here can be bought.

**Content:**
- **Cover imagery and identity:** display name, username, avatar, an optional one-line greeting,
  a bio, and location if given.
- **The creator's links** — their Instagram, YouTube and website, as given.
- **Counts:** posts, things tagged, followers.
- **Follow** (needs an account; must never block browsing) and **Share**.
- **Category chips / shelves** that filter the wall. "All" is the default. A profile with no
  categories must look completely normal.
- **The wall.** Two kinds of thing live on it, side by side:
  - **posts**, each showing what is tagged on them and at least one price;
  - **standalone products** — things the creator sells or recommends with no post behind them
    (an in-store coupon has nowhere to be tagged and is still a product).
  A product already tagged inside a post is shown via that post, never twice.
- **Comments on the page** (see §10.1).
- **Hidden posts never appear here** — they exist only in the creator's dashboard.
- **If the viewer owns a business:** an entrance to send this creator a collab request.
- **If the viewer owns this profile:** an entrance to the page's customisation options (§11).

**States:** full page · a profile with no posts yet · a shelf with nothing in it · comments off ·
comments empty · viewer signed out · viewer signed in and already following · viewer is the owner ·
viewer is a Manager · viewer owns a business.

### 6.5 Post view (`/<username>/post/<id>`)

**Job:** "this is what's in the video/photo" — and here is every one of those things.

**Content:**
- **The post's media.** A still shows as an image. **A video shows as a facade first:** the
  poster frame, a play control, and the provider's name. **Nothing is sent to YouTube/Instagram/
  TikTok until the shopper presses play** — same promise as the rest of the buy path. A "watch
  it there instead" link must sit with the frame **always**, because in-app browsers sometimes
  refuse to play an embed at all.
- The caption, and when it was posted.
- **Everything tagged on this post**, each with its image, name, price, where it goes (retailer,
  or the creator's own store), and its coupon code if it has one.
- Save · Share · Report.
- The creator's identity and a way back to their page.
- Comments are **not** on posts today (they live on the page and on products). If you want them
  here, that is a product change, not a design one.

**States:** still post · video post (facade → playing → provider refused to embed) · **nothing
tagged yet** · one thing tagged · many things tagged · post hidden or deleted (→ §9.1).

### 6.6 Product view (`/<username>/product/<id>`)

**Job:** one thing, in detail, with one obvious way to buy it and a way back.

**Content:**
- Product image, title, optional description.
- **Price.** May be absent — then say so honestly rather than showing a zero.
- **Which kind of product this is**, because the promise differs:
  - **Affiliate** — the button goes to the retailer through the creator's own affiliate link.
  - **The creator's own** — the button goes to the creator's own site or store. Carries a quiet
    trust marker; the button reads as going to *their* store. No commission language.
- **The coupon, when there is one:**
  - the **code**, with a one-tap copy;
  - an optional **expiry**;
  - the **redemption channel** — **online** (copy the code, shop through the link), **in-store**
    (show the code at the counter), or **both**;
  - an optional **in-store note** written by the creator;
  - **Rule: an in-store-only offer has no link and therefore no Buy button.** The code *is* the
    action. A Buy button here would promise a shop it cannot reach.
  - Code copies are counted; **redemption is not tracked and the screen must say so** —
    it happens at the retailer, where Plugfolio cannot see.
- **The buy hand-off.** One button. It must be honest about leaving: the shopper finishes at the
  retailer, in a store they already use; Plugfolio runs no cart or checkout and never sees their
  card; no account is needed.
- **Where it came from** — the post this product was tagged on, if any, as a way back into the
  content.
- The creator's identity and a way back to their page.
- Save · Share · Report.
- Comments (see §10.1).
- **If the viewer owns this product:** its own numbers, visible only to them.

**States:** with price / without price · affiliate / own · no coupon / online coupon / in-store
coupon (no button) / both / expired coupon · with a source post / standalone · signed out /
signed in / already saved / owner viewing.

### 6.7 Following (`/following`)

**Job:** the payoff for following. **A list, never a feed.**

**Content:** every creator the shopper follows, each row carrying who they are and **how many
new posts since this person last looked**. Searchable and sortable. Unfollow available inline.

**Rule:** no post is ever merged into a scrollable stream you buy from. Every route out of this
screen goes to that creator's own page.

**States:** populated · following nobody yet · a search that matches nobody · a creator whose
page has since disappeared.

### 6.8 Saved / watchlist (`/saved`)

**Job:** the shelf. Holds posts **and** products the shopper bookmarked, newest first.

**Content:** each saved item, still carrying **the creator who tagged it** — "who showed me
this" is half of why it was saved. Remove available inline.

**Rule:** it holds **no price**, reserves nothing, and buys nothing. Every card routes to that
post's or product's own page, where the tap happens exactly as it would have the first time.
It is a shelf, not a cart, and it must not read like one.

**States:** populated · nothing saved yet · an item whose target has been removed.

### 6.9 Account (`/account`) — shopper-facing account settings

**Content, in the sections that exist today:**
- **Identity** — the member `@handle`: how you appear when you act as yourself, following or
  commenting. Changeable. **The email is never shown publicly.**
- **Signing in** — your email is your login, your username is a second way in, one password
  behind both. Change password lives here.
- **Your roles** — what this account currently is (shopper / creator / business) and how to
  become the others.
- **Connections** — which social accounts are connected, and their state.
- **Leaving** — sign out, and account deletion. **Deletion is handled by a person, not a
  button** — it routes to support. Design that honestly.

**States:** each section idle / editing / saving / saved / failed · handle taken · no connections.

---

## 7. Creator surfaces (the dashboard)

**Framing:** the public page is the shop window. The dashboard is the back room, and it stays
small. Six sections today; a profile switcher decides which profile you are editing; a Manager
sees everything except profile settings and connections.

### 7.1 Dashboard home

**Content:**
- Which profile you are editing, and the switcher to the others (max 5).
- **What needs tagging** — posts that have imported but carry no products. This is the single
  highest-value thing on the screen: an untagged post earns nothing.
- What the account is connected to, and whether anything needs re-authenticating.
- **Traffic** (below).
- A way to view the live public page.

### 7.2 Traffic

Three measured counts and one rate. (Formerly called "Earnings", renamed because it earns
nothing — Plugfolio handles no money and sees no sale, so the word promised a number this
product cannot produce. **Do not reintroduce earnings language.**)

| Figure | Meaning |
|---|---|
| **Views** | A page, post or product page opening. |
| **Taps** | Someone leaving for a retailer, tied to the post that drove it — "this reel drove 312 taps." |
| **Tap-through** | Taps ÷ views. |
| **Code copies** | How many times a coupon code was copied. **Labelled "redemption not tracked."** |

**Rules:**
- **Views and taps are never shown apart.** 1,284 taps sounds enormous until you see 20,410
  views; 20,410 views sounds like reach until you see how few moved.
- **Every figure is tracked.** There is no estimated column, and inventing one would be the
  single dishonest thing in the product.
- Traffic is available per profile and **per post**; a post's own numbers should be readable
  where that post is being worked on.

**States:** numbers · a brand-new profile with zeroes (make that legible, not sad) · a range
with no activity.

### 7.3 Posts

**Content:** every post as a scannable list — is it on the page, which shelf it's on, how many
products are tagged. Opening one goes to the editor.

**Actions:** open · hide/unhide · create a new post manually.

**States:** posts · none yet (a fresh connection still importing) · filtered to a shelf · hidden
posts shown distinctly.

### 7.4 Post editor — **the core creator tool**

Everything a post is:
- **The still** — uploaded (cropped and watermarked on upload) or taken from the import.
- **An optional video** — the provider link that powers the facade on the public side.
- **The caption.**
- **The shelf** it sits on (one, or none).
- **What is tagged on it** — connect an existing product from the library, or create a new one
  without leaving. Disconnect available per product.
- **Hide from the page** — the post stays in the dashboard and disappears from the public page.
- **A live preview of what a shopper will see.**

**Rules to make visible in the interface:**
- **Connecting copies nothing.** Change a price once and every post carrying that product
  changes. This is the thing creators most often misunderstand.
- **Removing a product from a post is a disconnect, never a delete.**
- A product may sit on several posts, or on none.

**States:** new / existing · saving / saved / failed · nothing tagged yet · media missing ·
video link invalid · a Manager editing (identical, since Managers may tag) · unsaved changes.

### 7.5 Products (the library)

**Content:** a list you scan, never a CRM. Searchable. Every row opens that product's own editor.

**States:** products · none yet · a search that matches nothing.

### 7.6 Product editor

- **Kind:** *affiliate product* or *my own product*.
- **Link:** your affiliate link, or your store/product link. May be absent — which changes the
  public page (§6.6).
- **Title, description (optional), price, currency.**
- **Image:** upload your own (cropped, watermarked, stored) **or** paste an image URL. Uploading
  replaces the scraped image.
- **Pasting any product URL scrapes the image, title and price** to start from.
- **Coupon:** code · optional expiry · redemption channel (online / in-store / both) · an
  optional in-store note ("show at the counter"). **Clearing the code removes the whole offer.**
- **Shelf.**
- **A live preview of what a shopper will see.**
- Its own traffic figures.

**States:** new / existing · scraping / scraped / scrape failed (fill it in by hand) · uploading /
upload failed · coupon present / absent / expired · saved ("live on your page") / failed.

### 7.7 Categories (shelves)

Add · rename · reorder · delete. Each has a **title** and an optional **description**.

**Rules:** a post or product sits in **one category or none**. Uncategorised things are still
live — they show under "All". **Deleting a category never deletes content**; its items fall back
to "All", and the interface must say so before the delete. Admin *and* Managers curate categories.

### 7.8 Collabs (creator side)

Two lists in one place:
- **Open requirements** businesses have posted — browse and **approach** any that fit.
- **Incoming requests** from businesses who reached out directly.

Each becomes a **thread** (§8.3).

**States:** both lists populated · no open requirements · no incoming requests · an approach
already sent · a requirement since closed.

### 7.9 Settings

- **Identity** — display name, avatar, bio, greeting line, and the **public username** (chosen
  only from the handles on the connected socials).
- **Appearance** — the closed customisation set (§11).
- **Links** — the creator's own links shown on their public page. Empty fields are removed on save.
- **Connections** — connect / re-authenticate Google and Meta, with the disconnect rule of §4.5.
- **Managers** — invite up to 3, see their state, remove them.
- **The one destructive action** — delete this profile. Confirmed, consequences stated plainly.

**Rule:** a **Manager must not see** profile settings or connections.

---

## 8. Business surfaces

### 8.1 Creating a business

Name, what you sell, a logo, and an email. That is the whole sign-up.

### 8.2 Collabs — the one business surface

**Door one — post a requirement.** The brief: the product, the kind of content wanted, a budget
or price range, and a deadline. It lists on an open board; creators who fit tap Approach and a
thread opens. Requirements can be **closed** by the business.

**Door two — approach a creator.** Browse creator pages; when one fits, send a collab request
straight to that creator. (The entrance to this lives on the creator's public page and is shown
only to a viewer who owns a business.)

**Also on this surface:** your own posted requirements, and all your collab threads.

### 8.3 The collab thread

One simple conversation where both sides agree **what gets made, for how much, by when**.

- Free-text messages both ways.
- **Propose terms** — a structured proposal (content, price, deadline).
- **Accept** — each side accepts independently. The thread must always make clear **whose turn
  it is**: "the other side hasn't accepted yet" / "the other side has accepted" / "you accepted".
- Status is visible at a glance (e.g. negotiating / accepted).
- **Rule: no money moves here.** Once terms are agreed, the creator delivers and payment settles
  off-platform. The interface must say so rather than implying an escrow that does not exist.

**States:** new thread · awaiting the other side · terms proposed · one side accepted · both
accepted · closed/withdrawn · the requirement behind it was closed.

---

## 9. System screens — do not skip these

### 9.1 Not found (404)

**This screen does a security job, and the copy is load-bearing.** An unknown username, a
deleted post, a hidden post, and someone else's private collab thread **all land here with
identical words**. "You don't have permission" would confirm the thing exists — exactly what
someone probing for a private thread wants to learn. **The screen must never indicate which of
those four things happened.**

**Content:** the page doesn't exist · it may have been removed or the link may be wrong ·
**nothing you did caused this** · a way into Explore · a way home. It also carries a handful of
real creators the visitor can shop right now, because shopping needs no account and a mistyped
handle should be a wrong turn rather than a dead end. **Those suggestions are a bonus, never a
dependency** — if they cannot load, it is still a good 404.

### 9.2 Something went wrong (error boundary)

The sibling of the 404, deliberately the same screen wearing different words. Three rules:

1. **Take the blame** — "that's on us, not you". Someone who thinks they broke it stops trying,
   and they almost never did.
2. **Try again first.** A retry clears most of these; support is the second option.
3. **Never let the machine talk.** No stack trace, no exception name, no "500". Instead, a short
   **reference code** the operator can search and the visitor can read aloud — copyable.

It also states **what still works**: creator pages are unaffected, every link someone already
has still opens and every Buy on it still works; and **nothing was lost** — a half-finished save
did not go through, so nothing is half-written.

### 9.3 Loading

Every route has a loading state. It must not shift the layout when content arrives, and it must
appear fast enough on a slow in-app browser connection to prove the page is alive.

### 9.4 Empty, denied and offline

- **Empty** states exist on: Explore (no results, nothing yet), Following, Saved, comments,
  posts, products, categories, collabs, requirements, managers, connections. Each should say
  what would fill it and offer the action that does.
- **Denied**: any attempt to reach something you don't own resolves as §9.1 — never as a
  "forbidden" screen.
- **Offline / flaky connection**: assume it. Nothing on the buy path may depend on a background
  request succeeding.

---

## 10. Cross-cutting features

### 10.1 Comments

**Where:** on a creator's page, and on a product page. **Not** on posts (deferred).

**Rules and behaviour:**
- Requires a free account to write or react. **Reading always needs nothing.**
- **Threads exactly one level deep.** Anyone may reply to a comment; replies to replies are
  deferred.
- **Sortable:** newest (default) · oldest · most helpful.
- **Paged with an explicit "load more"**, never infinite scroll — someone reading answers should
  be able to reach the end.
- **Helpful / not helpful**, with counts. One reaction per account per comment, changeable.
  It exists because a creator page's comments are mostly *questions about the goods* ("does this
  ship to Pune?", "is the code still live?") and the useful answer needs to float without a
  moderator sorting it.
  **It scores a comment — never a product and never a creator.** It must not read as a rating.
- **Identity picker.** By default a comment is signed by the writer's member `@handle`. Anyone
  who belongs to creator profiles can instead speak **as one of those profiles** (brand name plus
  a "Creator" marker), on any page. The default always does the right thing untouched: on a page
  one of your profiles owns it preselects **that profile**; everywhere else it preselects your
  personal handle — so speaking as a brand on someone else's page is always deliberate.
- Every comment is reportable.

**States:** empty · sorted · loading more · posting · post failed · signed out (invite, never a
wall over the page) · own comment · creator's reply · reported.

### 10.2 Follow

Requires an account. Signed-out users must still see the control and be invited, never blocked
from the page. State must be immediately obvious after acting.

### 10.3 Save (watchlist)

Requires an account. Available on posts and on products. Same invitation rule as follow.

### 10.4 Share

Available on every public surface (page, post, product) and needs no account. Includes copying
the link, and the native share sheet where the device offers one.

### 10.5 Report

**Available to everyone, with no account** — on a comment, a product, and a page.
A reason (offensive · impersonation · and the other listed reasons) plus an optional free-text
note. It lands in the internal operator queue. **Reporting must never interrupt the buy path.**
States: form · sending · sent (acknowledge, say nothing about outcome) · failed.

### 10.6 View and tap measurement

Every page, post and product opening is recorded, and every outbound tap is recorded against the
post that drove it. **Invisible to the shopper.** It must never delay or gate the tap: the
shopper leaves, and the measurement follows. In-app browsers double-fire, so repeats are
de-duplicated — no design implication beyond "don't build a confirmation step".

### 10.7 The sponsored slot

**One** placement on Explore, **one per "load more" batch**. Off entirely until an operator
turns it on after agreeing a deal off-platform.

**Rules — all of them visible in the design:**
- **It never wears a creator's clothes.** No product tag, no price, no Buy label, and it must not
  be mistakable for a creator's card.
- It is **labelled Sponsored**, and carries a real **"Why this?"** disclosure explaining that it
  was placed by Plugfolio, is not a creator's pick, and was **not chosen from anything the
  visitor did** — this surface has no account to target against.
- No self-serve purchase, no billing, no plan, no targeting.

### 10.8 Image handling

Creator-uploaded images are cropped and watermarked on upload and stored by Plugfolio.
Product images may alternatively be scraped from a pasted URL or supplied as a URL.
States: uploading · processing · done · rejected (wrong type/too large) · failed.

### 10.9 Video

Any post may carry a video. It always loads as a facade first (§6.5), always offers "watch it
there instead", and never contacts the provider before the shopper presses play.

---

## 11. Creator page customisation — the closed set

A creator may change **how their public page looks**, from a **deliberately bounded** menu. It is
**not** a theme editor.

| Option | Choices today | Note |
|---|---|---|
| **Accent** | Five named colours: violet · indigo · coral · forest · magenta | **Closed *because* it is closed** — every option is guaranteed readable behind white label text, so a creator cannot pick a colour that breaks the Buy button on their own page. Whether the redesigned system keeps five, keeps colour at all, or offers a different bounded axis, is **your call** — but the guarantee is not negotiable. |
| **Header treatment** | Three: *Compact* (dense, gets to the goods fastest) · *Balanced* (identity, then shelves, then posts) · *Centred* (big avatar, centred; reads as a profile) | Names and behaviours are yours to redefine. Three is not sacred. |
| **Grid layout** | Three: *Grid* (tight photo grid, most posts on screen) · *Cards* (roomier, post title under each) · *List* (one per row, easiest to scan on a phone) | Same. |
| **Greeting** | One optional line above the name | |

**Not available, and should stay unavailable:** custom fonts, custom backgrounds, arbitrary
colours, section reordering, custom CSS.

**Yours to decide:** how these are presented and previewed, whether they are edited on the live
page or in settings, how many options each axis carries, and what the axes actually are — as
long as the result is a bounded set where every combination is guaranteed to work.

---

## 12. The three journeys, stage by stage

### 12.1 Shopper — the whole point (target: three taps, zero account)

1. **Arrive.** They tapped `plugfolio.com/<username>` from a bio link, in an in-app browser.
   The page loads instantly and shows the creator, their content, and nothing in the way.
2. **Tap a post.** The reel or photo opens with its tagged products right there.
3. **See the product.** Photo, price, the post it came from, one Buy button — plus the code to
   copy when there is an offer.
4. **Buy.** The button sends them out, to the retailer through the creator's affiliate link or
   to the creator's own store. The network credits the creator. Plugfolio measures the tap.

**Nothing between them and the product.** No popup, no signup wall, nothing to manage on the way
through, no rewards to understand, no feed to build.

**The optional detour:** if they want to **follow**, **save** or **comment**, *then* they make a
lightweight account (§4.2). Those three actions are the only things behind that door.

### 12.2 Creator — target: sign-up to a live shoppable page in under five minutes

1. **Sign up** with email + password; verify; pick a username.
2. **Connect a social** (Google/YouTube or Meta/Instagram) when ready.
3. **Create a profile** from the handles that connection exposes. Posts import automatically. A
   random username works immediately.
4. **Pick the real username** from the handles they actually own.
5. **Tag and publish.** Open a post, paste a product URL (image, title and price are pulled in),
   add the affiliate link or mark it as their own product, attach a coupon if they have one,
   publish.
6. **Drop the link in the social bio.**

**The moment that sells them: seeing their own reel become shoppable.** Onboarding drives
straight at that moment and stops.

### 12.3 Business — target: account to first creator conversation in under five minutes

1. **Create a business account** — name, what you sell, a logo, an email.
2. **Post a requirement** (creators come to you) **or approach a creator** (you go to them).
3. **Bargain in one thread** — content, price, deadline.
4. **Agree and deliver.** Money settles off-platform.

---

## 13. Limits, caps and content rules

| Rule | Value |
|---|---|
| Profiles per account | 5 |
| Admins per profile | 1 |
| Managers per profile | 3 |
| Social connections per profile | 1 Google + 1 Meta (at least one at all times) |
| Categories per post/product | 1, or none |
| Comment nesting | 1 level |
| Reaction per account per comment | 1, changeable |
| Sponsored placements | 1 per Explore page, 1 per load-more batch |
| Search query length | 80 characters |
| Explore results | capped per read; the wall states which end it reached |
| Username source | only handles on a connected YouTube/Instagram |
| Username conflicts | first verified owner keeps it |
| Currencies | products carry their own currency; prices may be absent |
| Coupon | code + optional expiry + channel (online / in-store / both) + optional in-store note |
| Money handled by Plugfolio | none, anywhere |

---

## 14. Every current page name, in one place — rename freely

| Current route | Current name | Role |
|---|---|---|
| `/` | Landing | Public |
| `/how-it-works` | How it works | Public |
| `/for-creators` | For creators | Public |
| `/for-business` | For business | Public |
| `/support` | Support | Public |
| `/explore` | Explore | Public |
| `/<username>` | Creator page / profile | Public |
| `/<username>/post/<id>` | Post view | Public |
| `/<username>/product/<id>` | Product page | Public |
| `/following` | Following | Shopper |
| `/saved` | Saved (the watchlist) | Shopper |
| `/account` | Account | Shopper |
| `/join` | Join | Auth |
| `/verify` | Verify | Auth |
| `/signin` | Sign in | Auth |
| `/forgot` | Forgot password | Auth |
| `/reset` | Reset password | Auth |
| `/dashboard` | Dashboard home (+ Traffic) | Creator |
| `/dashboard/posts` | Posts | Creator |
| `/dashboard/posts/new` | New post | Creator |
| `/dashboard/posts/<id>` | Post editor | Creator |
| `/dashboard/products` | Products | Creator |
| `/dashboard/products/new` | New product | Creator |
| `/dashboard/products/<id>` | Product editor | Creator |
| `/dashboard/categories` | Categories | Creator |
| `/dashboard/collabs` | Collabs | Creator |
| `/dashboard/settings` | Settings | Creator |
| `/collabs` | Collabs | Business |
| `/collabs/<id>` | Collab thread | Business |
| — | Not found (404) | System |
| — | Something went wrong | System |
| — | Loading | System |

**Names with a reason behind them** (change them only knowingly):
- **"Traffic"**, not "Earnings" — the product earns nothing and sees no sale.
- **"Saved"**, not "Wishlist" or "Cart" — it reserves nothing and holds no price.
- **"Things"** is used in places where "products" would read as merchandise the platform sells.
- **"Helpful / not helpful"**, not stars — it scores an answer, never a product or a person.
- **"Sponsored"** must remain unambiguous.

---

## 15. The internal operator console (separate application)

A separate desktop-first app for a handful of trusted internal operators. **Not a public
surface, never indexed, no marketing tone.** One operator role — everyone sees everything, so
there are no permission states to design.

**Screens that exist:** sign-in · set password · dashboard · members (+ member detail) ·
profiles (+ profile detail) · posts · products · comments · businesses · requirements · collabs
(+ collab thread reader) · reports queue · analytics · sponsored placements · support queue ·
settings · audit log · admins.

**What operators do:** moderate people and content, work the reports and support queues, settle
username disputes, create and control the sponsored placement, flip runtime settings, and read
platform analytics.

**Rules:** every destructive action is confirmed and audited, and the interface should make an
operator feel that weight — confirmations state consequences plainly and say where it is
recorded. Density is higher than the shopper app; this is a tool, not a shop.

*This console can be redesigned in the same pass or left as-is — but if the shopper-facing system
changes, it inherits the change.*

---

## 16. What is deliberately absent — and must stay absent

Designing these in would break a promise the product makes:

- **No cart, no checkout, no wallet, no on-platform payment** — for shopping or for collabs.
- **No sign-in wall on any path that ends in a Buy.**
- **No estimated, projected or predicted numbers.** No conversions, no revenue, no earnings.
- **No star ratings on products or creators**, and no "verified buyer" badges.
- **No aggregated feed** of followed creators' posts to scroll and buy from.
- **No ad targeting, no self-serve ad purchase, no ad billing.**
- **No referral or share-to-earn economy.**
- **No media kit, campaign manager or gifting logistics** on the business side.
- **No anonymous wishlist or price alerts.**
- **No arbitrary vanity usernames** unconnected to a social handle.
- **No custom themes, fonts, backgrounds or section reordering** on a creator page.
- **No payouts console** — Plugfolio never sits in the payment path.

The test for adding anything back: **it must not add a step to "tap, see, buy", and it must not
add a screen the creator has to learn.**

---

## 17. Non-negotiables for whatever gets drawn

1. **Design the phone first.** Most visitors arrive in an in-app browser on a mid-range phone.
2. **Every interactive element is reachable by keyboard and named for a screen reader.** Both
   themes must meet WCAG AA — the design must work in **light and dark**.
3. **Touch targets are comfortable on a phone**; body text never becomes unreadably small.
4. **No interaction may depend on hover.** Hover may enhance; it may never be the only route.
5. **Respect reduced-motion.**
6. **Every screen needs its loading, empty, error and permission-denied treatment** — not just
   its happy path.
7. **Nothing on the buy path may depend on JavaScript succeeding.**
8. **A price, a count or a code is a fact.** It must be legible at a glance and never decorative.

---

## 18. What to deliver back

Whatever form suits you, covering:

- Every screen in §6–§9, in **light and dark**, at **phone and desktop**.
- Every state named in this document — not only the populated one.
- The navigation architecture you chose, and what you moved, merged, renamed or removed, with
  the reason (this is the part the engineer needs most).
- The customisation set you chose for §11, and proof every combination works.
- A component inventory: what repeats, and what its variants are.
- Anything in this document you think is wrong. It describes the product as built, not the
  product as it must remain.
