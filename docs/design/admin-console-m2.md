# Admin Console — Milestone 2 Addendum (pending designs)

New screens, dialogs, and modules **not yet built and not covered by the v1 brief**
([admin-console.md](./admin-console.md)). Design these together with the v1 pass so
engineering can implement against finished designs. Everything inherits the v1 brief's
chrome, shared patterns (§3), tokens, and component inventory (§2) — same rule: **reuse
the existing kit, propose variants, never new primitives.**

Where the v1 brief already specifies something (pagination §3.3, AlertDialog confirms
§3.5, filter-row slots), it is *referenced* here, not repeated — but it **must be part
of the designed deliverables**, since none of it is built yet either.

---

## 1. Detail pages (new screen type)

The v1 console is list-only. Milestone 2 adds a **detail page pattern** — design it
once as a template, then the three instances. Shared skeleton: breadcrumb back to the
list (`Members / maya@…`), a **header band** (identity + status badges left, action
buttons right), then stacked content **sections as Cards**. Sections with lists reuse
the standard table typography; each section links to its full list screen pre-filtered.

### 1.1 Member detail (`/members/[id]`)

**Job:** everything about one account before acting on it.

- **Header:** email (H1-sized), name + mono `@handle` beneath; badges: Active /
  Unverified / Suspended, Creator · N, Business. Actions (right): "Resend
  verification" (only when unverified), "Send password reset", "Reset @handle"
  (PromptDialog — see §2.3), "Suspend / Unsuspend" (reason dialog — §2.1),
  overflow menu (`DropdownMenu`) holding **Delete account** (§2.2).
- **Sections:** Profiles (owned + managed, with role tag and per-row link) ·
  Connected socials (Google/YouTube, Meta/Instagram — provider icon, handle,
  connected date; read-only) · Business (name, description, links to business row) ·
  Recent comments (last 5, link to Comments filtered by author) · Follows (count +
  last few, muted) · Meta (joined date, member id mono).
- **States:** suspended header treatment (destructive-tinted band or badge emphasis
  — designer's call, must be unmissable); empty sections show one muted line.

### 1.2 Profile detail (`/profiles/[id]`)

**Job:** inspect a page before suspending it or releasing its username.

- **Header:** mono `/username` (H1), owner email + "+N managers" beneath; badges:
  Live / Suspended / Owner suspended; actions: "View public page" (new tab, only when
  live), "Release username" (v1 PromptDialog), "Suspend / Unsuspend" (reason dialog).
- **Sections:** Posts (thumbnail grid, 12 newest — the one place media previews are
  worth designing; each opens the media, with a per-post Remove) · Products (table:
  title, kind, coupon, taps · 30d, per-row Remove/Clear coupon) · Managers (email +
  invited date) · Categories (chips) · Stats band (followers, taps 30d, code copies
  30d as small StatTiles).

### 1.3 Collab thread reader (`/collabs/[id]`)

**Job:** the missing piece — read a reported negotiation to judge it. **Read-mostly.**

- **Header:** "Business ↔ /creator", source (requirement title or "Direct
  reach-out"), state badge (Negotiating / One side agreed / Agreed) with the two
  agreement timestamps when present.
- **Transcript:** the full message list, oldest first — sender name + role tag
  (Business / Creator), timestamp, body. Use the kit's message/bubble components;
  visually distinguish the two sides (alignment or accent, tokens only). This is a
  moderation view, not a chat app — no composer, admins never write into threads.
- **Per-message action (Tier 2):** a quiet overflow → "Delete message" (AlertDialog;
  audited) — design it, engineering may land it after the reader.
- **States:** long threads scroll within the page; empty thread ("No messages yet").

## 2. New dialogs

All follow the v1 dialog anatomy (§3.5 / PromptDialog spec).

### 2.1 Suspend with reason (replaces the plain suspend confirm)

- Title "Suspend member" / "Suspend profile"; body = same consequence copy as v1;
  plus a **required** `Textarea` "Reason (required — recorded in the audit log)",
  placeholder e.g. "Impersonation report #…". Cancel + destructive "Suspend".
- Unsuspend keeps a plain AlertDialog (no reason needed) — or an optional note field;
  designer's call, mark the choice.

### 2.2 Delete account (type-to-confirm)

- The heaviest action in the console. AlertDialog with: consequence list (profiles,
  posts, products, comments, follows — permanently deleted; taps survive as
  anonymous events), a mono line showing what to type (the member's `@handle`), an
  `Input` that must match before the destructive "Delete forever" button enables.
  GitHub-style. Cancel prominent.

### 2.3 Reset member handle

- The v1 release-username `PromptDialog` pattern applied to member `@handle`s:
  current handle → suggested `user-xxxxxxxx`, editable, same helper text, destructive
  confirm "Reset handle". (Covers names grabbed before they were added to the
  reserved list.)

## 3. New screens

### 3.1 Admins (`/admins`, System group — sidebar gains one item, icon `shield`)

**Job:** manage operators without the CLI.

- Table: **Admin** (email, name below) · **Added** (date) · **Last sign-in** (date,
  em-dash until sign-in auditing lands) · **Actions**: ghost "Reset password"
  (PromptDialog or emailed link — design assumes emailed link), destructive "Remove"
  (AlertDialog; cannot remove yourself — that row's button is disabled with a
  tooltip).
- Above or beside: primary "Add admin" → dialog (email + name; the invite email sets
  the password). Small card "Your account": change-your-own-password form (current +
  new password inputs, primary "Change password").

### 3.2 Reports queue (`/reports`, Content group, icon `flag`)

**Job:** turn moderation from proactive hunting into triage. (The product-side
"Report" affordance shoppers/creators use is **out of this doc's scope** — it gets its
own product brief; design the admin side now so both land together.)

- Table, oldest-open-first: **Reported** (target type icon + snippet/preview line —
  comment text, product title, profile name) · **Reason** (reporter's category chip:
  Spam / Scam / Offensive / Impersonation / Other + free text below) · **Reporter**
  (mono handle, or "Anonymous shopper") · **Age** (relative, "3h") · **Status**
  (secondary "Open" / outline "Resolved" / outline "Dismissed") · **Actions**: "View
  target" (jumps to the entity's detail/list row), "Resolve", "Dismiss".
- A resolved/dismissed filter toggle (default Open). Numbered pagination.
- Empty state: "No open reports — nothing in the queue."
- Dashboard gains an "Open reports" StatTile (9th tile) linking here.

## 4. Modules added to existing screens

- **Toasts** (`sonner`, bottom-right): success ("Suspended @maya — recorded in the
  audit log", with the reason) and failure variants. Design the pair; every mutation
  in the console uses them once built.
- **Filter row** under each list's page header (v1 brief already reserves the slot):
  status Select per screen (Members: All/Active/Unverified/Suspended · Products:
  All/Has coupon/Expired coupon · Audit: admin, action type, date range) + "Export
  CSV" ghost button at the row's right end (list screens + audit).
- **Bulk selection:** checkbox column (header = select page), and on selection a
  **sticky action bar** replacing the page header (count + the screen's bulk verbs:
  Members → Suspend; Posts/Products/Comments → Remove/Delete) with a destructive
  confirm naming the count ("Delete 14 comments?").
- **Analytics — trend module:** one line/bar chart card "Taps · last 30 days"
  (per-day), kit chart component, tokens only; code copies as a second series or
  toggle. Design the empty/no-data state too.
- **Dashboard — recent activity:** the v1 brief's optional module becomes real: last
  5 audit entries (time · admin · mono action · detail, one line each) + "View audit
  log" link.
- **Audit log:** gains the filter row above + numbered pagination (v1 brief §3.3 —
  unbuilt, must be in the designed set).

## 5. Deliverables checklist (add to the v1 list)

- [ ] Detail template + Member detail · Profile detail · Collab thread reader
- [ ] Dialogs: suspend-with-reason · delete-account (type-to-confirm) · reset-handle
- [ ] Admins screen (+ add-admin dialog, self password card)
- [ ] Reports queue (+ dashboard tile)
- [ ] Toast pair · filter row + CSV placement · bulk-select action bar
- [ ] Analytics trend card · dashboard recent-activity module
- [ ] Sidebar with the two new items (Admins under System, Reports under Content)

Implementation status: **none of this exists in the build yet** (backlog:
`docs/implementation/admin-app.md` → "Milestone 2"). The refined scope may cut items —
design in the checklist order above, which matches operational priority.
