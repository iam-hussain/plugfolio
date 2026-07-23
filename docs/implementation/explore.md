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
