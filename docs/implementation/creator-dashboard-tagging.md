# Creator dashboard — profiles, posts, and product tagging

**Journey served:** the creator journey in [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md) — create a profile, post content, **tag & publish** ("open a post, paste any product URL — Plugfolio grabs the image, title, and price — add the affiliate link"). The moment that sells: seeing your own content become shoppable.

## What's in vs. deferred (and why)

| In now | Deferred until API credentials exist |
|---|---|
| Profile creation with ADR-0004's rules: ≥1 connected social required, ≤5 profiles per account, random `creator-xxxxxxxx` username so the page works instantly | **Username picking from connected handles** — needs YouTube/IG APIs to enumerate the user's real handles |
| Manual post creation (media URL + caption) as the interim content source | **Automatic post import** from YouTube/Instagram |
| Env-gated Google/Meta OAuth providers in Auth.js (wired the moment `GOOGLE_CLIENT_ID`/`FACEBOOK_CLIENT_ID` + secrets exist; Google requests `youtube.readonly`) | Live connect flows (no OAuth app credentials yet; dev/e2e use a seeded connection row) |
| OG-scrape metadata grab on tagging | Per-retailer extraction adapters / oEmbed |

## Data model

No schema change — `Post`, `Product`, post↔product tagging, and Auth.js `Account` rows (= connections, ADR-0007) already exist. The seed adds a `google` connection for the dev creator so profile creation is exercisable.

## Services (`creator-content.ts`)

`createProfile` (connection + 5-cap rules, random username) · `createPost` · `tagProductToPost` (ownership + post-belongs-to-profile checks, then metadata grab with **hostname fallback — an unreadable page never blocks the tag**) · `updateProductAffiliateUrl` · `removeProduct` (both owner-checked via product→profile attribution). New ports: `ConnectionReadRepository`, `PostWriteRepository`, `ProductWriteRepository`, `ProductMetadataGateway`; `ProfileReadRepository` renamed to `ProfileRepository` (+ `create`, `countByUser`).

## API surface (apps/api)

`POST /api/profiles` · `POST /api/posts` · `POST /api/posts/:postId/products` `{url, affiliateUrl, profileId}` · `PATCH /api/products/:productId` `{affiliateUrl}` · `DELETE /api/products/:productId`. All session-gated. The OG gateway (`gateways/og-metadata.ts`) is a best-effort regex scrape (5s timeout, 500KB cap) returning null on failure.

## Dashboard surfaces

Every page renders inside `DashboardShell` (feature `product-tagging`): brand top bar +
`[Profile ▾]` switcher (DropdownMenu; switch stays on the current tab, "+ New profile" up to
the 5-cap) + mono-uppercase section tabs (Home / Posts / Products / Categories / Collabs /
Settings — Settings admin-only), per briefs 07–10.

- `/dashboard` — active-profile card (View page), untagged-posts nudge, profile chips + New-profile, connect status, earnings (stat tiles + by-post/by-product).
- `/dashboard/posts` — thumbnail grid with tagged/untagged chips, All/Tagged/Untagged filter (`?filter=`), Add-post dialog; each post opens the tagging editor.
- `/dashboard/posts/:postId` — the core tool: media + caption + category, tagged-product cards (same `ProductRow` as the Products tab), tag form (kind toggle, collapsible coupon), View-as-visitor link.
- `/dashboard/products` — every product of the profile (including ones whose post was deleted, via `listProducts`) as cards: image, kind tag, coupon chip, inline affiliate-link fix + coupon edit + remove.
- `/dashboard/settings` — Public profile (username + page URL; picking/rename lands with social APIs), Connections, Managers "N of 3" with invite/remove.

## Edge cases

- Deleting a product cascades its taps: that product's earnings leave the projection (profile totals rebuild without it). Post-level history for other products is untouched.
- All dashboard reads reuse the shopper read models scoped by the creator's own username — another profile's post 404s in the editor.
- Tagging a URL whose page can't be fetched creates the product titled by hostname; the creator fixes the title later (title editing lands with the products-tab polish).

## Verification

- Unit (`creator-content.test.ts`, 9 tests): connection rule, 5-cap, random username shape, ownership rejections, metadata use + hostname fallback, fix/remove authz.
- e2e: `/dashboard/posts` redirects unauthenticated; posts/profiles APIs 401 anonymous.
- Full curl loop: creator signs in → creates a second profile (seeded connection) → adds a post → tags a product → it renders on the public page; a user with no connection gets 403.
