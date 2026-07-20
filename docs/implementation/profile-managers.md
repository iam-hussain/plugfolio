# Profile Managers + collab door two

**Journeys served:** ADR-0004 / lean journey — "every profile has exactly one Admin (the account owner) and up to 3 Managers invited to help run that profile" with the two-role permission table; and the business journey's **door two**: "browse creator pages, and when one fits, send a collab request straight to their Collabs tab."

## Managers

- **Data model** (`20260720160000_profile_managers`): `ProfileManager` with composite `(profileId, userId)` PK — invites are idempotent by construction. The Admin is simply `Profile.userId`; no role column exists.
- **Invite by email**: a `User` row is found-or-created for the invitee (`UserRepository.findOrCreateByEmail`); their normal magic-link sign-in picks the membership up — no separate acceptance flow in v1.
- **Permission split, enforced in services** per the ADR-0004 table:
  - *Admin or Manager* (`listAccessibleByUser`): post content, tag products, fix/remove products, act in collab threads, see Posts/Products/Earnings/Collabs tabs.
  - *Admin only* (`listByUser`): invite/remove Managers (`/dashboard/settings`), and — when they land — connections, username, profile create/delete. A Manager calling a settings API gets 403; the settings page redirects them.
- **Cap**: `MAX_MANAGERS_PER_PROFILE = 3`, `ConflictError` beyond it; inviting the Admin themself is a Conflict.
- **API**: `POST /api/profiles/:id/managers` `{email}` · `DELETE /api/profiles/:id/managers/:userId` (session-gated, Admin-checked in the service).
- **Dashboard**: switcher now shows managed profiles with a "· manager" badge; the Settings nav link renders only for Admins.

## Door two UI

Signed-in users who own a business see a **Request collab** form on any creator page (`RequestCollabForm` → existing `POST /api/collabs/request`); the thread lands in the creator's Collabs tab as before. Anonymous shoppers and non-business users see nothing new — the shop surface stays untouched (§2.2).

## Verification

- Unit (`profile-managers.test.ts`, 6 tests): admin-only invite/remove/list, 3-cap, self-invite conflict, invitee find-or-create.
- e2e: `/dashboard/settings` redirects unauthenticated; invite API 401s anonymously.
- Curl loop: admin invites a fresh email → invitee signs in via magic link and sees the managed profile → posts to it (allowed) → tries the settings API (403) → business user sends a door-two request from the creator page.
