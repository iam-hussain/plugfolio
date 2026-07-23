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
| **Profiles** (`/profiles`) | Search by username/owner email; content counts; **Suspend / Unsuspend** one page (owner still signs in) and **Release username** (drops the page to a fresh random `creator-…` name — settles ADR-0004's "first verified owner keeps it" disputes; the freed name is instantly claimable). |
| **Posts** (`/posts`) | Search caption/profile; **Remove** (stolen/illegal media). Products stay; taps survive (`postId` SetNull). |
| **Products** (`/products`) | Search title/profile; kind + coupon (with Expired badge); **Clear coupon** and **Remove** (counterfeit/prohibited links — taps cascade, same as a creator's own removal). |
| **Comments** (`/comments`) | Newest-first firehose; shows personal `@handle` vs speaks-as-profile badge; **Delete** (replies cascade). |
| **Settings** (`/settings`) | **Reserved usernames** (admin-managed additions on top of a code baseline) and **feature flags** (add / toggle / remove). |
| **Audit log** (`/audit`) | The append-only `AdminAction` trail, newest first. |

Destructive actions confirm first (`ConfirmButton`) and audit what was
removed — comment/product deletions record a snippet of the deleted body/title
taken from the DB row, not from the form.

Planned next (per the admin roadmap): businesses/requirements/collabs
oversight, analytics. The sidebar only links screens that exist.

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
