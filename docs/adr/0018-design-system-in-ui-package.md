# ADR-0018 — The design system lives in `@plugfolio/ui`, product-aware components included

## Context

[ADR-0016](./0016-tagged-feed-theme.md) committed "The Tagged Feed" as the theme.
The design workspace (`../plugfolio-design/`) carries the *system* that theme
describes: twelve pages built from a shared vocabulary — roughly 350 CSS classes
that dedupe to ~70 components. Several appear on four or five pages each
(`.pcard`, `.coupon`, `.cm-*`, `.tile`, `.claim`, `.empty`, `.notice`, `.field`).

CLAUDE.md §5 says `components/` is "generic only — if a component knows about
'creators' or 'collabs', it belongs in a feature". Applied literally, the shared
vocabulary would be split: `.pcard` in `features/creator-page/`, but the post
view, product view, explore wall and creator page all need it, so it would be
re-imported across feature boundaries — which §5 also forbids except through a
feature's public `index`. The rule was written for one app's feature slices, not
for a design system used by three apps.

The practical symptoms were already visible: `ProductTag` and `Tile` had been
promoted to `@plugfolio/ui` as "signature components", `SearchField` grew an
`inputClassName` escape hatch because a caller needed a different size, and the
same card was drifting between `PostGrid`, `TaggedProductCard` and the explore
grid.

## Decision

**Every visual component in the design system lives in `@plugfolio/ui`,
including the product-aware ones.** `ProductCard`, `CouponBlock`,
`CommentThread`, `CreatorHeader`, `ShelfChips`, `MediaSlot` and the rest are
themed, storybook'd primitives that take data as props.

- **`@plugfolio/ui` knows shapes, never sources.** A component may take a
  `product` prop; it may not fetch one, import `@plugfolio/core` at value level,
  or know a repository exists. Type-only imports from core are allowed so the
  props match the read models — value imports are not, and the reason is
  concrete: they drag `node:crypto` into the client bundle and break the build.
- **`apps/web/src/features/*` keeps what it is good at**: data fetching, server
  actions, the client-side interactive wrappers, and the composition that turns
  a read model into props. A feature owns *behaviour*; the UI package owns
  *appearance*.
- **Every component ships with a story.** The gallery in `apps/web/stories/` is
  the review surface for the design system, because most of these states never
  occur together in seed data (this is how a whole set of commercial flags was
  once mistaken for missing).
- **The design's measurements win** over our existing scale. Where a component
  needs a spacing, radius or size step we don't have, the step is added to
  `@plugfolio/tokens` as a named value rather than inlined — so "pixel by pixel"
  and "no magic values" (§8) stay compatible.

## Consequences

- CLAUDE.md §5 is amended: `components/` in `apps/web` is now for app chrome and
  composition only; the shared vocabulary is in `@plugfolio/ui`.
- Cross-feature duplication of the same card stops being possible, because there
  is one card.
- `@plugfolio/ui` grows large. That is the point — it is the design system, and
  its size is the design's size, not accidental scope.
- Colour and type are untouched by this ADR: the committed palette (ADR-0016)
  and the three families stay exactly as they are. This is about which
  components exist and how they are laid out.

## Status

Accepted. Supersedes the "generic only" reading of CLAUDE.md §5 for shared
visual components; §5's feature-slice rules otherwise stand.
