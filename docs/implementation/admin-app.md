# Admin app — internal ops surface

*Serves: platform operations (not a product journey). Decision: [ADR-0014](../adr/0014-admin-app.md).*

`apps/admin` is a third Next.js deployable (dev port **7078**) for trusted
operators: login page → sidebar dashboard. It reuses `@plugfolio/ui` +
`@plugfolio/tokens` (it *is* the design system) and talks to the database
directly via core services + db repositories — no admin endpoints in
`apps/api`, no HTTP layer of its own.

## Screens (v1 of the admin)

| Screen | What's there |
|---|---|
| **Sign in** (`/signin`) | Email + password against `AdminUser`. No self-service sign-up; operators are invited from the Admins screen (or seeded by CLI) and set passwords via `/set-password` links. |
| **Dashboard** (`/`) | Count tiles: members, profiles, businesses, posts, products, and 7-day taps / code copies / comments. |
| **Members** (`/members`) | Search by email/@handle/name; role + status badges; **Suspend / Unsuspend** per member. |
| **Profiles** (`/profiles`) | Search by username/owner email; content counts; **Suspend / Unsuspend** one page (owner still signs in) and **Release username** — a `PromptDialog` showing current → suggested random `creator-…` name, editable so the admin can accept or type a replacement (validated: slug shape, not reserved, not taken; conflicts surface as a page alert). Settles ADR-0004's "first verified owner keeps it" disputes; the freed name is instantly claimable. |
| **Posts** (`/posts`) | Search caption/profile; **Remove** (stolen/illegal media). Products stay; taps survive (`postId` SetNull). |
| **Products** (`/products`) | Search title/profile; kind + coupon (with Expired badge); **Clear coupon** and **Remove** (counterfeit/prohibited links — taps cascade, same as a creator's own removal). |
| **Comments** (`/comments`) | Newest-first firehose; shows personal `@handle` vs speaks-as-profile badge; **Delete** (replies cascade). |
| **Businesses** (`/businesses`) | Search name/description/owner email; requirement + collab counts; **Clear logo** (inappropriate image — account-wide abuse stays on Members). |
| **Requirements** (`/requirements`) | The open collab board; **Remove** a scam brief (existing threads survive — schema `SetNull`). |
| **Collabs** (`/collabs`) | Read-only thread oversight: business ↔ creator, source (board vs direct), message count, agreement state. |
| **Analytics** (`/analytics`) | Projections over the append-only `Tap`/`CodeCopy` events: 7/30-day totals, tap-source split, top profiles + products. Tables only — charts wait for demand. |
| **Settings** (`/settings`) | **Reserved usernames** (admin-managed additions on top of a code baseline) and **feature flags** (add / toggle / remove). |
| **Reports** (`/reports`) | The triage queue (M2): user flags with target snippet, category + note, reporter, age; Resolve / Dismiss; open queue is oldest-first. |
| **Admins** (`/admins`) | Operator management (M2): invite by email (link sets the password), reset links, remove (never yourself / never the last operator), change-your-own-password card, last sign-in column. |
| **Member detail** (`/members/[id]`) | Header card with resend-verification, send-password-reset, reset-@handle (PromptDialog), suspend-with-reason, and type-to-confirm **Delete account**; profiles w/ roles, connected socials, recent comments, meta. |
| **Profile detail** (`/profiles/[id]`) | Stat band (followers, taps · 30d, copies · 30d), 12-newest post grid with per-post Remove, products table with taps, managers, categories, View public page. |
| **Collab thread** (`/collabs/[id]`) | The reader (M2): full transcript with role-attributed bubbles and per-message delete; admins never write into threads. |
| **Audit log** (`/audit`) | The append-only `AdminAction` trail with admin / action-prefix / date-range filters. |

Every list is server-paginated (25/page, numbered `Pager`; Comments uses
Load-more), carries status filters where the design names them, a CSV export
route, and — on Members/Posts/Products/Comments — bulk selection with a
sticky action bar. Suspensions require a reason recorded in the audit
detail. The chrome is the designed sidebar (icon-collapsible, cookie-persisted)
with a top bar carrying the page title and a cookie-persisted theme toggle;
mutation feedback is toasts (sonner).

**Design source:** `docs/design-out/Plugfolio Admin.dc.html` — implemented
pixel-per-spec on the shared kit (PageHeader, SearchField, Pager, dense Table,
ConfirmDialog, PromptDialog, StatTile, square Badges, xs Buttons).

Destructive actions confirm first (`ConfirmButton`) and audit what was
removed — comment/product deletions record a snippet of the deleted body/title
taken from the DB row, not from the form.

The reusable pieces live in `@plugfolio/ui` with Storybook stories
(`ConfirmButton`, `StatTile`, the brand `Logo` the sidebar header uses, plus
the shadcn kit); the admin keeps only composition (`SearchHeader`,
`AdminSidebar`) and pages.

That completes the planned v1 admin surface — the sidebar only links screens
that exist.

## Milestone 2 — shipped (July 2026)

The backlog that lived here was implemented wholesale with the designer's
`Plugfolio Admin.dc.html` (see the screens table above): detail pages incl.
the collab thread reader, pagination + filters + CSV, member actions
(resend/reset/handle/delete), suspension reasons, the Admins screen with
invites, the Reports queue (admin side; the product-side "Report" affordance
is still to come and gets its own product brief), message-level moderation,
bulk actions, toasts, and the theme toggle. Remaining deliberate gaps:
login rate-limiting / revocable admin sessions, and product-side feature-flag
call sites (`isFeatureEnabled` has no readers yet).
