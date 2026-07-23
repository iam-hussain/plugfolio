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
| **Sign in** (`/signin`) | Email + password against `AdminUser`. No sign-up, no reset — operators are seeded by CLI. |
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
| **Audit log** (`/audit`) | The append-only `AdminAction` trail, newest first. |

Destructive actions confirm first (`ConfirmButton`) and audit what was
removed — comment/product deletions record a snippet of the deleted body/title
taken from the DB row, not from the form.

The reusable pieces live in `@plugfolio/ui` with Storybook stories
(`ConfirmButton`, `StatTile`, the brand `Logo` the sidebar header uses, plus
the shadcn kit); the admin keeps only composition (`SearchHeader`,
`AdminSidebar`) and pages.

That completes the planned v1 admin surface — the sidebar only links screens
that exist.

## Milestone 2 — backlog (unrefined)

The agreed gap list, July 2026. **Not yet refined** — before building, this
section gets turned into a scoped plan (what's in, what stays deferred, order);
items may be cut or reshaped in that discussion. Tiered by how soon each bites
in real operations.

### Tier 1 — felt in the first week of real operations

1. **Detail pages** — everything is list-only today. A member detail (their
   profiles, comments, follows, connected socials), a profile detail (inspect
   posts before suspending), and most consequentially a **collab thread
   reader**: Collabs shows message *counts* but a reported harassment thread
   cannot be read at all.
2. **Pagination** — lists cap at the newest 50. The design brief
   (`docs/design/admin-console.md` §3.3) already fixes the pattern: numbered
   pages (25/row) everywhere, load-more only for the Comments stream.
3. **Member actions beyond suspend** — resend verification, force a
   password-reset email, admin reset of a member `@handle` (the reserved list
   can't retroactively free a name someone already holds), and **account
   deletion** (today a GDPR/erasure request has no path).
4. **Suspension reason** — `suspendedAt` is a bare timestamp; suspensions need
   a required note that lands in the audit detail.
5. **Admins screen** — operators are CLI-seeded only; no UI to list/add/remove
   admins, no self-service password change.

### Tier 2 — structural, deliberately deferred

6. **Reports / moderation queue** — nothing lets users flag content, so
   moderation is proactive-only. Needs a product-side "report" affordance
   first; the admin side is the triage queue.
7. **Admin auth hardening** — rate-limited login, audited admin sign-ins
   (only mutations are audited today), revocable sessions (a lost laptop's
   12h JWT can't be killed).
8. **Message-level moderation** — delete one abusive collab message without
   suspending the whole member.
9. **Business text takedowns** — logo can be cleared, an offensive
   name/description cannot.
10. **Feature-flag call sites** — Settings writes flags and `isFeatureEnabled`
    exists, but product code doesn't read any flag yet; the switchboard is
    wired to nothing.

### Tier 3 — polish

11. Replace remaining native `confirm()` takedowns with `AlertDialog`
    (release-username already has its `PromptDialog`; the design brief §3.5
    specifies the rest).
12. List filters (status / date / action type — audit log especially) and CSV
    export.
13. Success toasts (today the changed row is the only feedback).
14. Analytics time-series/trends; the dashboard "recent activity" feed slot.
15. Bulk actions (select-many → suspend/remove).

Dependencies to note during refinement: reports (6) needs product-side UI;
member email actions (3) need the real mail transport (still console-logged);
several Tier-1 items (1, 2, 11) are already specified in the design brief and
should land together with the designer's pass.

## Data model

- `AdminUser` — operator identity (email, scrypt `passwordHash`, name).
  Separate from product `User` by design (ADR-0014).
- `AdminAction` — append-only audit: `adminId`, dot-namespaced `action`
  (`member.suspend`, `settings.featureFlag`), optional `targetType`/`targetId`
  /`detail`.
- `AppSetting` — `key` → JSON `value`; keys owned by core services with Zod
  validation and safe fallbacks (`reservedUsernames: string[]`,
  `featureFlags: Record<string, boolean>`).
- `User.suspendedAt`, `Profile.suspendedAt` — the suspension flags admins flip.

## Services (in `@plugfolio/core`)

- `verifyAdminCredentials` — admin login check.
- `searchMembers`, `suspendMember`, `unsuspendMember` — member moderation
  (audited; typed `NotFoundError` on unknown ids).
- `searchProfiles`, `suspendProfile`, `unsuspendProfile`,
  `releaseProfileUsername` — profile moderation; release reuses
  `generateProfileUsername()` from creator-content.
- `searchComments/Posts/Products`, `deleteComment`, `deletePost`,
  `deleteProduct`, `clearProductCoupon` — content takedowns.
- `searchBusinesses`, `searchRequirements`, `listCollabs`,
  `clearBusinessLogo`, `removeRequirement` — marketplace oversight.
- `getReservedUsernames`, `setReservedUsernames`, `isUsernameReserved` — the
  admin list *extends* `BASELINE_RESERVED_USERNAMES` (product routes + brand
  terms, e.g. `dashboard`, `explore`, `homepage`); it can never unblock the
  baseline. Checked case-insensitively.
- `getFeatureFlags`, `setFeatureFlag`, `removeFeatureFlag`,
  `isFeatureEnabled(deps, name, fallback)` — the product read path defaults to
  `fallback` for unknown flags, so a missing row never breaks a feature.

## Enforcement in the product

- **Login**: `verifyCredentials` returns `reason: "suspended"` (checked only
  *after* the password, so suspension is never an email oracle); web sign-in
  shows "This account is suspended."
- **Public reads**: creator page, its post/product views, and Explore filter
  `suspendedAt: null` on the profile **and** its owning user — a suspended
  page is a plain 404 to shoppers.
- **Member handles**: `updateMemberHandle` rejects reserved names (baseline ∪
  admin list). Profile-username claiming reuses `isUsernameReserved` when that
  flow lands.

## Edge cases

- Suspension never deletes data; lifting it restores everything as-was.
- A corrupt `AppSetting` row degrades to the default (Zod `.catch`) instead of
  crashing a read path.
- Admin sessions are 12-hour JWTs under an `admin.`-prefixed cookie so local
  dev never clobbers a web session; `robots` is noindex on every page.

## Ops

```bash
pnpm --filter @plugfolio/db db:migrate            # apply the admin_app migration
pnpm --filter @plugfolio/admin create-admin you@plugfolio.com <password> "Your Name"
pnpm --filter @plugfolio/admin dev                # http://localhost:7078
```
