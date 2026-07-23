# Admin Console — Design Brief (all screens)

The internal operations app at `admin.plugfolio.com` (`apps/admin`). Operators sign in,
moderate people and content, settle username disputes, flip runtime settings, and read
platform analytics. This brief covers **every screen** — the login page plus the twelve
console screens — in enough detail to design the full set.

**Read first:** [`00-foundations.md`](./00-foundations.md) for tokens, type, and spacing.
The admin uses the **same "Charged Violet" system and the same UI components** as the
product (`docs/design-out/` — Brand Guidelines v1.1, `Plugfolio UI.dc.html`, Dev Spec).
**Do not invent new primitives** — every element below maps to an existing kit component
(listed per screen); propose new *variants* of existing components if a screen needs one.

---

## 1. Context & ground rules

- **Audience:** a handful of trusted internal operators ("admins"). Not a public surface,
  never indexed, no marketing tone. Efficient, calm, information-dense — a tool, not a shop.
- **Desktop-first.** Unlike the shopper surface (mobile-first 360px), admins work on
  laptops: design at **1280–1440px** primary. It must degrade gracefully to tablet
  (sidebar collapses to off-canvas via the existing Sidebar component's built-in
  behavior); phone support is "usable", not optimized.
- **Light theme is the working default** (`data-theme="light"`); dark must resolve
  cleanly through the same tokens (design both, as everywhere).
- **Density:** tighter than the shopper app. Tables at 13–14px body, 44px row height.
  Space Mono for identifiers (`@handle`, `/username`, action verbs, flag names),
  tabular Inter numerals for every count and date.
- **Every destructive action is confirmed and audited.** The UI language should make
  operators feel the weight: destructive buttons use the destructive tone, confirm
  dialogs state consequences plainly, and copy mentions "Recorded in the audit log"
  where it happens.
- **Roles:** v1 has one admin role (every operator sees everything). No permission
  states to design.

## 2. Component inventory (all existing — reuse, don't redraw)

| Kit component | Where it appears |
|---|---|
| `Sidebar` family (rail, groups, menu buttons, inset, trigger) | Global chrome |
| `Logo` / `PlugMark` / `Wordmark` (brand lockup) | Sidebar header, login card |
| `StatTile` (mono eyebrow + big tabular number on a Card) | Dashboard, Analytics |
| `Table` family | Every list screen |
| `Badge` (default / secondary / outline / destructive) | Status & role chips |
| `Button` (primary / secondary / ghost / destructive, sm) | Actions everywhere |
| `Input`, `Textarea`, `Label` | Search, login, Settings |
| `PromptDialog` (Dialog + one labeled input + confirm) | Release username |
| `ConfirmButton` → design as `AlertDialog` | Destructive confirmations (see §3.5) |
| `Alert` (destructive variant) | Page-level error banners |
| `Card` | Dashboard tiles, Settings sections, Analytics panels |
| `Skeleton` | Loading states |
| `Pagination` | Every paginated list (see §3.3) |
| `Empty` | Empty states |
| Icons: lucide only | Sidebar + inline (list per screen below) |

## 3. Global chrome & shared patterns

### 3.1 Sidebar (persistent, left)

- **Header:** brand lockup (`Logo`, auto tone) with a Space Mono `ADMIN` eyebrow under
  it — the wordmark is the product's, the eyebrow says which surface you're on.
- **Groups & items** (lucide icon + label; exactly these, in this order):
  - *(no label)* — Dashboard (`layout-dashboard`)
  - **People** — Members (`users`) · Profiles (`user-square`)
  - **Content** — Posts (`image`) · Products (`shopping-bag`) · Comments (`message-square`)
  - **Marketplace** — Businesses (`briefcase`) · Requirements (`clipboard-list`) · Collabs (`handshake`)
  - **Insight** — Analytics (`bar-chart-3`)
  - **System** — Settings (`sliders-horizontal`) · Audit log (`scroll-text`)
- **Active item:** Violet Wash fill (`--surface-active`, #EFEAFB on light) with ink text,
  rounded-md — the selected-state token, not a bespoke color.
- **Footer:** signed-in admin email (truncated, muted, 12px) + a Sign out item (`log-out`).
- Collapsible to icon rail on demand; off-canvas on narrow viewports (component built-in).

### 3.2 Top bar & content area

- Slim top bar (~48px): sidebar toggle at left; room for the page title/breadcrumb if
  the design wants it there instead of in-content. Keep it quiet.
- Content area: 24px padding, max readable width free (tables want width).

### 3.3 Pagination — per-screen requirement

Current build caps lists at the newest 50; the design should specify the full pattern:

| Pattern | Screens | Why |
|---|---|---|
| **Numbered pages** (`Pagination` component, 25 rows/page, prev/next + page numbers, "Showing 26–50 of 1,204" caption) | Members · Profiles · Posts · Products · Businesses · Requirements · Collabs · **Audit log** | Operators jump around, compare pages, return to a spot, and share "page 3" with a colleague. Audit especially needs to walk back in time. |
| **Load more** (button under the list appending the next 25, sticky "N new" affordance optional) | **Comments** | It's a newest-first moderation stream — you sweep from the top downward; page numbers would shift under you as new comments arrive. |
| **None** | Dashboard · Analytics · Settings · Sign in | Fixed-size content. |

Search + pagination combine: searching resets to page 1; the query persists in the
URL (`?q=…&page=…`) so results are shareable.

### 3.4 List screens — the shared skeleton

Every list screen is: **page header** (H1 title left; search `Input` + secondary
`Search` button right, GET form, placeholder names the searchable fields) → optional
error `Alert` → `Table` → `Pagination`. Sortable columns are **not** in scope (newest
first everywhere); don't design sort affordances.

Typography rules inside tables: identifiers in Space Mono 12px (`@maya`,
`/gadget-guru`, `member.suspend`); dates as `2026-07-23` tabular; counts tabular;
primary cell may stack a second muted 12px line (e.g. email + name).

### 3.5 Destructive confirmation

Two tiers, both designed:

1. **AlertDialog confirm** (replaces the current native `confirm()`): title = the verb
   ("Remove this post?"), body = consequence in one or two sentences (what survives,
   what doesn't, "This can't be undone", "Recorded in the audit log"), Cancel (ghost) +
   destructive confirm button naming the action ("Remove post"). Used by: Suspend*,
   Remove post/product/requirement, Delete comment, Clear coupon, Clear logo.
   (*Suspend is reversible — its dialog says so and its confirm button reads "Suspend".)
2. **PromptDialog** (confirm + one input): only Release username today — see §4.3.

### 3.6 States

- **Loading:** skeleton rows in tables (5 rows), skeleton tiles on dashboards.
- **Empty:** one quiet line inside the table body ("No members match." / "Nothing yet —
  admin mutations land here."), no illustration needed.
- **Error:** destructive `Alert` above the table with a title + the human reason
  ("Username not released — That username is already taken").
- **No toasts in v1** — mutations refresh the list in place; design must read correctly
  without a success toast (the changed row is the feedback).

---

## 4. The screens

### 4.0 Sign in (`/signin`)

**Job:** the only door; operators only. No sign-up, no password reset, no SSO.

- Centered `Card`, max-w ~384px, on the plain page background: Space Mono `PLUGFOLIO`
  eyebrow, `Admin` display title (or the Logo lockup + "Admin"), one line of copy —
  "Operators only. Sign in with your admin credentials."
- Email + Password (`Input` + `Label`), full-width primary `Button` "Sign in".
- Single error state, one generic line: "Wrong email or password." (never reveals which,
  never reveals whether an account exists).
- Footer note (muted, 12px): "Accounts are provisioned by an existing operator." —
  states there's no self-service without inviting attempts.
- That's the whole page. No links out.

### 4.1 Dashboard (`/`)

**Job:** the daily glance — is anything moving, is anything on fire.

- H1 "Dashboard".
- **8 `StatTile`s** in a 4-column grid (2-col on tablet): Members · Profiles ·
  Businesses · Posts · Products · Taps · 7d · Code copies · 7d · Comments · 7d.
- Each tile links to its section screen (whole tile clickable, subtle hover raise).
- Optional design slot (build later): a "Recent activity" panel under the grid — the
  latest 5 audit entries; design it as an optional module, the build may follow.

### 4.2 Members (`/members`)

**Job:** find any account, see what it is, suspend/unsuspend it.

- Search: email / @handle / name.
- Columns: **Member** (email, name as second muted line) · **@handle** (mono) ·
  **Roles** (`Badge secondary`: "Creator · 2" = owns 2 profiles; "Business"; none = blank) ·
  **Status** (`Badge`: outline "Active" / outline "Unverified" / destructive "Suspended") ·
  **Joined** (date) · **Actions** (right-aligned).
- Actions: destructive sm "Suspend" ↔ secondary sm "Unsuspend" (state-swapped, with
  AlertDialog: suspending blocks login and hides every profile they own; reversible;
  nothing deleted).
- Numbered pagination.

### 4.3 Profiles (`/profiles`)

**Job:** the creator-page registry — suspend a single page, settle username disputes.

- Search: username / owner email.
- Columns: **Username** (`/name`, mono) · **Owner** (email; "+N managers" muted second
  line when managed) · **Content** ("12 posts · 8 products · 310 followers", muted
  tabular) · **Status** (outline "Live" / destructive "Suspended" / destructive "Owner
  suspended") · **Actions**.
- Actions: ghost sm **"Release username"** + destructive/secondary **Suspend/Unsuspend**
  (suspend here darkens only this page; the owner still signs in — dialog copy says so).
- **Release username → `PromptDialog`** (design this dialog fully; it exists in
  Storybook as *UI Kit/PromptDialog*):
  - Title "Release username"; description: frees `/current` for its rightful owner —
    the lever for impersonation, squatting, and handle disputes (first verified owner
    keeps the name); page stays live at the new address; nothing deleted; freed name
    claimable immediately; recorded in the audit log.
  - Context block (muted panel): "Current — `/gadget-guru`" over "Becomes —
    `/creator-4f9d21ab` — or the name you enter below".
  - One labeled input "New username for this page", prefilled with the suggested random
    `creator-…` name, fully editable; helper line: "3–30 characters: lowercase letters,
    numbers, dots, dashes. Keep the suggestion or type your own."
  - Cancel (ghost) + destructive "Release & rename".
  - Failure (name reserved / taken) surfaces as the page-level `Alert` after close.
- Numbered pagination.

### 4.4 Posts (`/posts`)

**Job:** takedowns for stolen/illegal media.

- Search: caption / profile.
- Columns: **Post** (caption line, truncated; "View media" link under it, opens the
  media in a new tab — no inline thumbnails in v1) · **Profile** (mono `/name`) ·
  **Products** (count) · **When** (date) · **Actions**: destructive sm "Remove"
  (AlertDialog: tagged products stay; recorded taps survive; can't be undone).
- Numbered pagination.

### 4.5 Products (`/products`)

**Job:** takedowns for counterfeit/prohibited links; sweep stale coupons.

- Search: title / profile.
- Columns: **Product** (title; second muted line = price + "Outbound link" anchor) ·
  **Profile** (mono) · **Kind** (outline Badge "Affiliate" / "Own") · **Coupon**
  (secondary mono Badge with the code; destructive "Expired" Badge beside it when past
  expiry; em-dash when none) · **Actions**: ghost sm "Clear coupon" (only when a coupon
  exists) + destructive sm "Remove" (AlertDialog: removes the product **and its
  recorded taps** — same cascade as a creator's own removal).
- Numbered pagination.

### 4.6 Comments (`/comments`)

**Job:** the #1 recurring task — a newest-first moderation stream.

- Search: text / author / page.
- Columns: **Comment** (body, truncated ~2 lines; "N replies (deleted with it)" muted
  line when it has replies) · **By** — the identity rule, make it scannable: personal
  authors as mono `@handle` text; brand-voiced comments as a secondary Badge
  `/profilename` (this is the self-promo-spam signal — the Badge should pop) ·
  **On** ("/page · Product title" muted, truncated) · **When** · **Actions**:
  destructive sm "Delete" (AlertDialog: replies go with it).
- **Load more** (not page numbers — see §3.3).

### 4.7 Businesses (`/businesses`)

**Job:** oversight of brand accounts; strip inappropriate logos.

- Search: name / description / owner email.
- Columns: **Business** (name; description truncated muted below) · **Owner** (email) ·
  **Activity** ("3 requirements · 5 collabs", muted tabular) · **Status** (outline
  "Active" / destructive "Owner suspended") · **Actions**: ghost sm "Clear logo" when a
  logo exists ("No logo" muted text otherwise). Account-level abuse routes to Members.
- Numbered pagination.

### 4.8 Requirements (`/requirements`)

**Job:** the open collab board — pull scam briefs.

- Search: title / brief / business.
- Columns: **Brief** (title; brief text truncated muted below) · **Business** ·
  **Budget** (free text or —) · **Deadline** (date or —) · **Approaches** (collab
  count) · **Actions**: destructive sm "Remove" (AlertDialog: comes off the board;
  existing threads survive).
- Numbered pagination.

### 4.9 Collabs (`/collabs`)

**Job:** read-only thread oversight. **No actions on this screen** — the design should
carry a one-line explainer under the header: "Read-only oversight — a bad actor in a
thread is handled by suspending the member."

- Search: business / profile.
- Columns: **Business ↔ Creator** ("Verve Gear ↔ `/maya`") · **Source** (requirement
  title, or "Direct reach-out") · **Messages** (count) · **State** (secondary Badge
  "Agreed" / outline "One side agreed" / outline "Negotiating") · **Started** (date).
- Numbered pagination.

### 4.10 Analytics (`/analytics`)

**Job:** platform-level read of the one number that matters — outbound taps.

- Header + one line: "Projections over the append-only tap and code-copy events — the
  same truth Earnings reads."
- **4 `StatTile`s**: Taps · 7d / Taps · 30d / Code copies · 7d / Code copies · 30d.
- **Two leader `Card`s side by side** (stack on tablet): "Top profiles · 30d" (mono
  `/username` + right-aligned tap count, 10 rows) and "Top products · 30d" (title with
  mono `/username` below + tap count, 10 rows).
- **"Tap sources · 30d"** small Card: three rows (profile / post / product) + counts.
  A proportion bar per row is a welcome design touch (tokens only); numbers required.
- Tables only in v1 — **no time-series charts yet**; if the design includes a trend
  chart slot, mark it clearly as a later module.

### 4.11 Settings (`/settings`)

**Job:** runtime configuration — reserved usernames and feature flags.

- Two stacked `Card`s, max-w ~768px:
- **Reserved usernames**: description ("Names no member handle — and, when username
  claiming lands, no profile username — may take…"); the **baseline** as a wrapped row
  of small outline mono Badges (admin, api, dashboard, homepage, … — always blocked,
  visually inert/non-removable); then a mono `Textarea` (one name per line) for the
  admin-managed additions + primary "Save reserved usernames".
- **Feature flags**: description mentioning removal returns a feature to its built-in
  default; a small `Table` — Flag (mono) · State (secondary "On" / outline "Off") ·
  Actions (secondary sm "Turn off/on" + ghost sm "Remove") — with the empty line "No
  flags set — everything runs on defaults."; below it an add-row: mono `Input`
  placeholder `new-flag-name` + secondary "Add flag (on)".

### 4.12 Audit log (`/audit`)

**Job:** the append-only trail — who did what, when, to which entity.

- Columns: **When** (`2026-07-23 19:04`, tabular) · **Admin** (email) · **Action**
  (mono dot-verbs: `member.suspend`, `profile.releaseUsername`,
  `settings.featureFlag`) · **Target** (mono `type:id`, truncated) · **Detail** (muted,
  truncated — e.g. `lena → creator-4f9d21ab`, a deleted comment's snippet).
- Empty line: "Nothing yet — admin mutations land here."
- Numbered pagination. Optional design slot for later: filter by admin / action type /
  date range — design the filter row as a dormant module if desired.

---

## 5. Deliverables checklist

One layout per screen at 1280–1440, light theme (dark via tokens — one dark sample
screen is enough to prove the tokens hold):

- [ ] Sign in
- [ ] Dashboard
- [ ] Members (incl. suspend AlertDialog state)
- [ ] Profiles (incl. **Release username PromptDialog** — closed + open states)
- [ ] Posts · Products · Comments (one shared list-pattern spec is fine, plus each
      screen's columns; Comments shows the **Load more** pattern)
- [ ] Businesses · Requirements · Collabs
- [ ] Analytics
- [ ] Settings
- [ ] Audit log
- [ ] Shared: table skeleton/loading, empty, error Alert, pagination, collapsed sidebar

Match the delivery format of the existing design-out (`.dc.html` pages per screen, same
token variables). The engineering build already exists for every screen above — the
design pass restyles and refines it, so any component you use must exist in the kit
(§2) or be proposed as a variant of one.
