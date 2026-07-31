# Profile identity — name, picture, bio & delete (Settings, brief 10)

**Journey served:** brief 10's Public profile section and its one destructive action. Until now the creator page's header could only show `@username` + an initial tile, and a profile could never be deleted by its owner.

## Data model

Migration `20260724…_profile_identity`: `Profile.displayName?`, `avatarUrl?` (image URL — uploaded per ADR-0023, or pasted), `bio?`. All nullable; null renders the old defaults (@username, initial tile).

## Services (`profile-identity.ts`)

`getMyProfileIdentity` (Admin or Manager; returns the caller's role for the form) · `updateProfileIdentity` — the Admin edits everything; **a Manager may change ONLY the picture** (name/bio in a Manager payload → 403, per brief 10's one-control rule) · `deleteProfile` — Admin-only, cascades the page's content and frees a profile slot (username frees with the row).

## API surface

`PATCH /api/profiles/:profileId` `{displayName?, avatarUrl?, bio?}` (null clears a field) · `DELETE /api/profiles/:profileId`. Session-gated; role checks in the service.

## Surfaces

- **Settings → Public profile**: avatar preview + Picture URL, Name, Bio, one Save (`ProfileIdentityForm`). The Settings tab now shows for Managers too; they get the picture control with Name/Bio visibly disabled ("Admin only" — never silently hidden) and the Admin-only cards replaced by a hint. **Danger zone** card: Delete profile with confirmation (`DeleteProfileButton`), redirects to the dashboard.
- **Public creator page**: `CreatorPage` read model now carries the identity; the header renders photo avatar, display name over `@username`, and the bio.

## Edge cases

- Manager PATCH with name/bio → 403; nothing written. Stranger → 403 everywhere.
- Deleting the active profile lands the owner back on `/dashboard` with their next profile (or the empty state).
- Deletion cascades posts/products/links/taps (same semantics the admin app uses).

## Verification

- Unit (`profile-identity.test.ts`): Admin full-edit, Manager picture-only, stranger/Manager-delete rejections, Admin delete.
- Driven in dev: Settings save → photo, "Lena Okafor" and bio live on `/lena`; created a throwaway profile and deleted it through the API — row gone, slot freed.
