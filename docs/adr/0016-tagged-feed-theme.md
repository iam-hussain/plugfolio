# ADR-0016 — "The Tagged Feed" theme (light-committed)

## Context

The original visual system ("Charged Violet") was **dark-first**: a violet-tinted
dark canvas with light overrides, Inter body type, and no content-colour palette. A
fresh design pass (recorded in `../plugfolio-design/DESIGN.md`) reframed the product
as *the daylight side of the creator economy* — a cool near-white ground, real
photography inside saturated colour tiles, and the mechanism made visible as a
**product tag pinned onto a photograph**. The two systems disagree on the ground
colour, the body font, the button language, and whether content carries colour, so
the theme could not be split between them.

## Decision

Adopt **"The Tagged Feed"** as the one global theme for every app (web, admin,
creator dashboard), rebuilt in the shared token layer:

- **Light-committed.** Canvas `#FCFBFE` is the page (`--surface`), white is a *lift*
  reserved for raised objects (`--surface-muted`). Light is the `:root` default; dark
  is fully preserved through the same tokens (a deep violet-tinted canvas).
- **Body type is Manrope** (was Inter); Sora stays for display; Space Mono stays for
  data. Loaded via `next/font` in each app layout, read into `--font-sans` / etc.
- **A six-hue tile palette** (butter/mint/sky/lavender/coral/blush) as new semantic
  tokens — content colour, never chrome (`bg-tile-*` + `text-tile-foreground`).
- **Component language:** the primary `Button` is a pill that fills Ink and arrives
  at Brand Violet on hover; new shared `ProductTag` (the signature white pill) and
  `Tile` primitives; the design radius (image/tile/card/bay) and soft shadow
  (rest/tag/lift) scales; cards tilt 1–2° and straighten on hover.

Brand Violet, Electric Lime (fill-only, offer-only), the PlugMark, and the
no-inline-styles / no-raw-hex / CVA rules are unchanged.

## Consequences

- Every surface re-skins automatically through the shared tokens — no per-component
  colour edits — but admin and the creator dashboard change palette and button shape
  and warrant a human visual pass.
- `--brand-canvas`, `--brand-coral`, and `surfaceLight`/`surfaceDark` constants shift;
  the theme-color meta and OG artwork follow.
- The marketing landing (`/`) is rebuilt as a bespoke Persuade surface (the fanned
  deck, the tile trail, the pick-your-side bento) rather than wrapped in `ShopperShell`.
- The earlier "Charged Violet" description in older `docs/design/` briefs and
  `docs/design-out/` is superseded by this ADR and CLAUDE.md §7 where they disagree;
  per-brief copy is reconciled as those surfaces are next touched.

## Status

Accepted. Supersedes the implicit "Charged Violet" theme of ADR-0001's stack table
and CLAUDE.md §7.
