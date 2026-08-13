# SEO, AEO & sharing — how the public surfaces get found and shared

The public shopper surfaces (§4: landing, explore, creator pages, posts,
products) are the SEO product. This note maps every discovery/sharing
mechanism and where it lives.

## Metadata (per page)

- `apps/web/src/app/layout.tsx` sets the site-wide base: `metadataBase`
  (SITE_URL), the title template, description, keywords, `openGraph`
  site defaults and `twitter.card = summary_large_image` (X and friends fall
  back to the page's og:* values, so pages don't repeat themselves).
- Every public route exports `metadata`/`generateMetadata` with a title,
  description and a **canonical** (`alternates.canonical`) — query-string
  variants (explore search, comment sort/page) canonicalize to the bare route.
- Identity constants live in `apps/web/src/lib/site.ts`
  (`NEXT_PUBLIC_SITE_URL` overrides per environment).

## Share cards (og:image) — generated, per entity

File-convention `opengraph-image.tsx` routes (Next serves them and wires the
meta tags; file-based images take precedence over config, so pages don't set
`openGraph.images`):

- **`/` (root)** — the brand card (ink→violet, lockup, "no login to shop").
- **`/[handle]`** — identity card: avatar (violet ring), display name,
  `plugfolio.com/handle` in lime, post/follower counts.
- **`/[handle]/post/[postId]`** — media-led card: the post still on the left,
  caption + byline + tagged-count on the right.
- **`/[handle]/product/[productId]`** — product card: image, title, price in
  lime, "tagged by @handle".

Shared vocabulary in `apps/web/src/lib/og.tsx`: `OG_SIZE`, `ogFonts()`
(bundled OFL fonts — no network), `ogGround`, `OgLockup`, `OgChip`, and
`ogImageData()` which fetches page media into a data URI with a 4s timeout.
Two satori gotchas it absorbs:

1. **WebP**: our uploads are WebP (ADR-0023) and satori only rasterizes
   png/jpeg/gif — anything else is transcoded to PNG with sharp. A failed or
   slow fetch degrades to the branded fallback, never a 500.
2. **Text nodes**: satori chokes on mixed/numeric JSX children — every text
   run in a card is a single template-literal string.

## Structured data (JSON-LD, SEO/AEO)

Builders in `apps/web/src/lib/structured-data.ts`; the rule: **only facts the
visible page already shows.**

- Landing `/`: Organization + WebSite (with SearchAction → `/explore?q=`) +
  FAQPage (in `app/page.tsx`).
- Creator page: ProfilePage/Person (socials as `sameAs`) + BreadcrumbList.
- Post: **SocialMediaPosting** (media, caption, author, tagged products as
  `mentions`) + BreadcrumbList.
- Product: Product with Offer (display price/currency) + BreadcrumbList.
- `/how-it-works`: FAQPage from the visible native-`<details>` FAQ.

## Sitemap — every profile, post and product

`apps/web/src/app/sitemap.ts` lists the static routes plus, via the
`sitemapCreators` service (`@plugfolio/core` explore service →
`DiscoveryReadRepository.listSitemapCreators`, Prisma impl in
`@plugfolio/db`): every **live** profile (not suspended, ADR-0014), each of
its **visible** posts, and all of its products. `lastModified` is `createdAt`
(no updatedAt exists); the creator page takes its freshest item's date.
Capped at 5,000 creators — move to `generateSitemaps` sharding before that's
real. A discovery read failure degrades to the static routes, never a 500.

The "visible post" predicate matches both not-hidden shapes (Mongo absent
*and* stored-null after unhide) — the explore wall shares it, which also
fixed unhidden posts never returning to Explore.

## Crawler surface

- `robots.ts` — shopping surfaces open; account/dashboard/auth routes
  disallowed; points at `sitemap.xml`.
- `llms.txt` — the machine-readable product digest for AI agents/answer
  engines (kept in sync by hand).
