# Member handles, comment identity & categories

**Journey served:** the lean journey's "Every account also gets a member handle" + "Who a
comment speaks as" (shopper journey) and "Categories — the creator's shelves". Decisions:
[ADR-0009](../adr/0009-member-handles-and-comment-identity.md) ·
[ADR-0010](../adr/0010-per-profile-categories.md). Designer brief:
[change-brief-handles-and-categories.md](../design/change-brief-handles-and-categories.md).

## Data model

Migration `20260721090000_member_handles_and_categories`:

- `User.username` — the member handle, globally unique, required (backfilled
  `user-<12 hex of id>` for existing rows). Generated at every User-creation site via
  `generateMemberHandle()`: the Auth.js adapter's wrapped `createUser` (first sign-in)
  and `findOrCreateByEmail` (manager invites).
- `Comment.asProfileId` — nullable FK to `Profile`, **SET NULL** (a deleted profile's
  comments fall back to the person). Null = the comment speaks as `@handle`.
- `Category` — `(profileId, title, description?, sortOrder)`, title unique per profile,
  cascade with the profile.
- `Post.categoryId` / `Product.categoryId` — nullable, **SET NULL**: deleting a shelf
  never deletes content; items fall back to "All".

## Services (`@plugfolio/core`)

- `updateMemberHandle` — reserved-word check + uniqueness (`"taken"` → `ConflictError`);
  `getMemberHandle` for reads. Handle shape: `/^[a-z0-9][a-z0-9._-]{2,29}$/`, lowercased
  at the Zod boundary.
- `addComment` — now takes `asProfileId?`; membership (Admin **or** Manager of that
  profile) is verified via `listAccessibleByUser`, never trusted from the client
  (`ForbiddenError` otherwise).
- Categories: `listMyCategories` / `createCategory` / `updateCategory` / `removeCategory`
  (Admin + Manager — same tier as tagging) and `setPostCategory` / `setProductCategory`.
  A category from another profile is a 404, so cross-profile assignment can't happen.

## API surface

- `PATCH /api/me/handle` `{username}` → 200; 409 on taken/reserved.
- `POST /api/profiles/:profileId/categories` `{title, description?}` → 201; 409 duplicate title.
- `PATCH /api/categories/:categoryId` `{title?, description?, sortOrder?}` · `DELETE /api/categories/:categoryId`.
- `PATCH /api/posts/:postId/category` `{profileId, categoryId|null}` · `PATCH /api/products/:productId/category` `{categoryId|null}`.
- `POST /api/comments` gains optional `asProfileId`.
- Reads stay endpoint-free: the public page server-renders categories + comment identities;
  dashboard pages call `listMyCategories` directly (§6.11).

## Components

- `CommentForm` — "commenting as" picker (native select; the design brief's sheet
  treatment lands with the design pass): personal `@handle` first, then each profile the
  user belongs to. Default: the page's own profile when the user is a member, else
  personal — per comment, never sticky. Users with no profiles see plain text.
- `CommentList` — profile identity + "Creator" badge when `asProfile` is set, else
  name + `@handle`.
- `HandleForm` on the new `/account` page (linked from `/following`).
- `CategoryChips` (public page) — "All" + chips filtering the grid via `?category=`;
  renders nothing when the profile has no categories. Active category's description shows
  under the row; an empty shelf offers "see All".
- `CategorySelect` (tagging editor + product rows) — single-select + "None", saves on change.
- `CategoryManager` on `/dashboard/categories` — add/delete; delete confirms
  "posts and products stay".

## Edge cases

- Handle backfill uses 12 uuid hex chars — unique in practice; the user can change it anyway.
- Reserved handles: small hard-coded list (`admin`, `api`, …) — grow as needed.
- The identity picker's `asProfileId` is revalidated server-side on every comment; a
  removed Manager's next brand comment fails 403 even if their form still offers it.
- Category filter is in-memory on the already-loaded page — no new read paths, and an
  unknown `?category=` id silently falls back to "All".

## Verification

- Unit: `shopper-social.test.ts` (speak-as allowed for members, 403 for outsiders),
  `creator-content.test.ts` (duplicate title 409, outsider 403, assign/unassign,
  cross-profile category 404).
- No live DB in this environment: `prisma validate` + generate pass; migration SQL is
  hand-written in the repo's existing style. Run `prisma migrate deploy` + seed on the
  first credentialed environment.
