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
  - `listCreators(query, limit)` → `DiscoveryCreator` (id, username, follower/post/
    product counts, latest post media as the card thumbnail — profiles have no avatar
    field yet).
  - `listProducts(query, limit)` → `DiscoveryProduct` (`ShopperProduct` + username).
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

## Design system (ADR-0018)

Explore's vocabulary now lives in `@plugfolio/ui` (DESIGN `explore.html`):

- `CreatorFan` / `CreatorCard` — the rail of tilted, overlapping cards. Scoped to Creators it switches to `layout="grid"`: a rail says "there is more sideways", a result set has to say "this is the set".
- `PostWall` / `WallPost` — a **grid, not CSS columns**. Columns balance their heights, so an odd count (5 cards across 3) puts one in the first column and leaves a card-sized hole under it; a grid places row-wise, and the reading order finally matches the DOM order. One column below 560px, because at two columns the photo lands at ~135px and a tag pill needs 90–140px — every tag would overflow its own photograph.
- `ThingsGrid` / `ThingCard` — Things is its own view, not the posts wall relabelled. A scope control that doesn't scope is worse than no control.
- `AdSlot` / `AdSlotWhy` — deliberately **not** a wall tile: full-width, no tilt, no tag pill, no tabular price, no Buy label. Every one of those belongs to a creator's recommendation, and an ad wearing them is claiming to be one. Square-shouldered against 26px cards so the difference reads before the label does.
- `WallEnd` / `WallEndNote` — a list that simply stops reads as a list that broke, so the wall always says which end it reached. The reads are capped at `EXPLORE_PAGE_SIZE` (24) with **no paging yet**, so at the cap it says "showing the first 24" rather than claiming that's everything. `ponytail:` real `?page=` paging when the discovery reads take a skip — the design's "Load more" is a plain link by design, so it works with scripting off and keeps the footer reachable.

Stories: `Explore/Wall` — creator rail, creator results, wall, things, sponsored, both ends.
