# Profile links — the creator-page socials row ("Your links")

**Journey served:** the creator page's header (design-out: every creator page MUST carry a socials row — Instagram · YouTube · TikTok · Facebook · personal website — authored in dashboard Settings → "Your links"). Until now the row was presentational-only and always empty.

## Data model

Migration `20260724…_profile_links`: `ProfileLink` — `(profileId, platform)` PK, `url`, cascade on profile delete. Platform is a string column constrained by the Zod enum (`instagram | youtube | tiktok | facebook | website`) at the boundary; no position column — the row renders in that fixed canonical order (drag-to-reorder deferred with the social APIs, along with connected-social auto-fill).

## Services (`profile-links.ts`)

`getProfileLinks` (public read, sorted canonical) · `listMyProfileLinks` / `setProfileLinks` (**Admin-only** — Settings surface per ADR-0004; Managers get 403). The save is **replace-all**: the Settings form has one URL field per platform and one Save; empty fields clear the link.

## API surface

`PUT /api/profiles/:profileId/links` `{links: [{platform, url}]}` — session-gated, one-per-platform enforced by the schema.

## Surfaces

- **Settings → "Your links" card**: five labeled URL inputs + Save (`ProfileLinksForm`).
- **Public creator page**: fetches links RSC-direct and feeds `SocialsRow` via `CreatorHeader`; website links are labeled by hostname. Empty set → the row renders nothing (unchanged).

## Edge cases

- Duplicate platform in one payload → 400 from the schema refine.
- Non-URL or >500-char values → 400; nothing partial is written (delete+create run in one transaction).
- Deleting the profile removes its links (cascade).

## Verification

- Unit (`profile-links.test.ts`): Admin-only enforcement, replace-all semantics, canonical ordering.
- Driven in dev: Settings save → row live on `/lena` with icons + labels; empty save clears it.
