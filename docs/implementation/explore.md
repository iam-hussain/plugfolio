# Explore — public discovery of creators & products

**Journey served:** the shopper's front door when they don't arrive via a creator's
bio link — browse/search creators and products, then tap through to shop. Design
source: the design-out prototype's **discover** screen (`Plugfolio UI.dc.html`) and
Dev Spec §06. No login anywhere on this surface (§2.2).

## Data model

No schema change. Discovery reads existing rows: `Profile` (+ relation counts) and
`Product` (+ owning profile's username).

## Read model & service

- Port `DiscoveryReadRepository` (`@plugfolio/core`, `ports/discovery-repository.ts`):
  - `listCreators(query, limit)` → `DiscoveryCreator` (id, username, **displayName**,
    **avatarUrl**, follower/post/product counts, latest post media as the card photo).
  - `listProducts(query, limit)` → `DiscoveryProduct` (`ShopperProduct` + username +
    the creator's `avatarUrl`, for the card byline).
  - `listPosts(query, limit)` → `DiscoveryPost` (id, username, avatarUrl, mediaUrl,
    **caption** — the card's title — up to 3 tags and the product count).
- Service `services/explore.ts`: `exploreCreators` / `exploreProducts` trim + clamp the
  query (≤80 chars) and page size (24). Query matches username / product title,
  case-insensitive contains.
- Prisma impl `@plugfolio/db` `repositories/discovery-repository.ts` (counts via
  `_count`); wired in the web composition root.

## Surface

`/explore` (RSC, `features/explore/`): heading, viewer note (guest vs signed-in),
**Creators / Products** tabs (links, `?tab=`), search (plain GET form, `?q=` — works
without JS, in-app-browser safe), count line, result grids per the design cards.
Creator cards link to `/[handle]`; product cards to `/[handle]/product/[id]` (the
outbound tap + attribution happen on the product page as usual).

## Deliberately not built (needs data that doesn't exist yet)

Region / following-size / verified filters, niche chips, and trending sort from the
prototype — profiles carry none of those fields in v1. Add them when the data lands;
the filter row slots under the search bar per the design. Pagination is a single
24-item page ("load more" comes with real volume).

## Design system (ADR-0018) — one card, three contents

Explore used to carry **three card languages on one page**: a 152px tilted creator
stamp, a full-bleed colour tile for a post, and a white commerce card for a product.
Three widths, three aspect ratios, three ways of writing "@lena" — the sections read
as three stacked websites. The vocabulary in `@plugfolio/ui` is now one chassis:

- `DiscoveryCard` — the chassis. Colour **mat** → 4:5 photo → byline (avatar + who) →
  title → footer rule (a number on the left, the way out on the right). A creator, a
  post and a thing differ only in what they say. Its one link is the **title,
  stretched** over the card (`[&>a]:after:absolute inset-0`): the hit target is the
  card, the accessible name is the title, and no empty overlay anchor reads as "link,
  link, link" to a screen reader. Pins sit at `z-10`, above that stretch, so a tag
  stays tappable.
- `DiscoveryGrid` — **the same grid in all three sections** (2 up on a phone, 3 from
  560px, 4 from 900px), so the columns line up the whole way down the page. That one
  fact does most of the work of "consistent".
- `DiscoveryRail` — the creator deck on the All tab, and **the only place the resting
  tilt survives** (§7). A rail says "there is more sideways"; scoped to Creators the
  same cards drop into the grid, because a result set has to say "this is the set".
- `discoveryTone(index)` / `DISCOVERY_TONES` — the mat hue, assigned by **position in
  the list, never by category** (§7 tile rule). Colour still carries the page; it no
  longer arrives as a saturated block that dwarfs the card beside it.
- `ProductTag` + `DiscoveryPinMore` — the signature, kept and disciplined. A post wore
  three tags at preset coordinates (tag positions aren't stored), which read as
  decoration and regularly landed on the subject; it now wears **one**, pinned at the
  foot of the frame where it can't cover what you're looking at, plus a `+N` that opens
  the post. One row, never wrapped — the tag truncates, the counter keeps its size.
- `DiscoveryAvatar` — one mark, one size, on all three card kinds.
- **Sponsored slot (ADR-0020)** — `AdPlacement` rows created in the admin app at
  `/sponsored`, read by `getLiveAdPlacement` and gated on the `ads` feature flag, which
  **defaults to false** (every other flag defaults on; an ad nobody remembered enabling
  is a worse failure than a missing one). The newest live placement wins.
- `AdSlot` / `AdSlotWhy` — deliberately **not** a discovery card: full-width, no mat,
  no tag pill, no tabular price, no Buy label. Every one of those belongs to a
  creator's recommendation, and an ad wearing them is claiming to be one.
- `WallEnd` / `WallEndNote` — a list that simply stops reads as a list that broke, so
  the wall always says which end it reached. The reads are capped at
  `EXPLORE_PAGE_SIZE` (24) with **no paging yet**, so at the cap it says "showing the
  first 24" rather than claiming that's everything. `ponytail:` real `?page=` paging
  when the discovery reads take a skip.

The same chassis carries **/saved** (`WatchlistPage`): a saved thing is the same object
it was when you saved it, and a shopper shouldn't have to relearn a card between the
two screens.

Storybook: `Explore/Discovery` — the rail, the creator results grid, posts, things, and
`OneChassisThreeContents`, which puts all three kinds in one row.

### The `cn()` bug this redesign surfaced

`tailwind-merge` knows Tailwind's own `text-xs…text-9xl` are font sizes and files every
other `text-…` as a **colour**. Our named scale (§7) is all "other", so
`cn("text-background … text-micro")` looked like two colours and quietly dropped the
first — which is why the `+N` pill first shipped ink-on-ink, an empty black circle. The
scale is now declared in `packages/ui/src/lib/cn.ts` via `extendTailwindMerge`; add a
step to the Tailwind preset and add it there in the same change.
