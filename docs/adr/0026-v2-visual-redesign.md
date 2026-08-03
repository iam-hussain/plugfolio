# ADR-0026 — The v2 visual redesign ("Plugfolio v2")

**Status:** Accepted · supersedes [ADR-0016 ("The Tagged Feed" theme)](./0016-tagged-feed-theme.md)
and amends [ADR-0017 (creator page appearance)](./0017-creator-page-appearance.md).

## Context

The product was redesigned end-to-end against the functional spec in
[`docs/design/redesign-functional-spec.md`](../design/redesign-functional-spec.md). The design
source of truth is the interactive prototype **`Plugfolio v2.dc.html`** in the Claude Design
project (`claude.ai/design/p/8369dea3-…`, "Plugfolio Design"); its token values and component
shapes are distilled into [`docs/design/v2-visual-system.md`](../design/v2-visual-system.md).
The design covers every screen — public, shopper, auth, creator dashboard, business, system and
the operator console — in light and dark, phone and desktop.

## Decision

Adopt the v2 visual system across `@plugfolio/tokens`, `@plugfolio/config` (Tailwind preset),
`@plugfolio/ui` and `apps/web`. The headline changes from "The Tagged Feed":

1. **The page is white; cards are the tint.** Light canvas is `#FFFFFF`; raised surfaces are
   the violet-tinted `#F8F7FB` and inset ("sunk") fields `#F1EFF7`. This inverts the old
   "white is a lift" rule. Dark canvas `#16141F`, cards `#1F1C2B`, sunk `#272234`.
2. **Inter replaces Manrope** as the UI/body face. Sora stays for display; Space Mono is
   promoted from "code only" to the label voice: uppercase, letter-spaced micro-labels,
   eyebrows, prices-adjacent metadata, status pills.
3. **The colour tiles are retired.** No `Tile` hues on shopper surfaces; saturated colour now
   arrives only as the page accent, the ink panels, and photography.
4. **One accent, five options, page-scoped** (amends ADR-0017): violet `#7C3AED` (default) ·
   indigo `#3D4EE8` · coral `#FF6B5C` · forest `#1C7A5C` · magenta `#C4247E`. The accent drives
   `--color-primary`; everything downstream keeps reading the token. *Known deviation:* coral
   `#FF6B5C` behind white label text measures ~3.1:1 — below AA for the small-bold labels it
   carries. Shipped as drawn to stay faithful to the design; flagged to the designer for a
   darker press-state or an ink-text variant before GA.
5. **Lime `#C6FF3D` stays offer-only** (fill + ink text). Coral `#FF6B5C` becomes the one
   danger/destructive colour; forest `#1C7A5C` the one success colour.
6. **The morphing pill nav.** The bottom tab bar is replaced by a fixed, centred ink pill that
   changes contents by context: browse tabs (Home/Shop/Follow/Saved/You) on list surfaces; a
   back + Follow + share pill on a creator page; a back + save + Buy pill on post/product; the
   dashboard section tabs inside the dashboard. It is the signature component of v2.
7. **Creator page appearance set** (amends ADR-0017): accent (5) × header (compact/balanced/
   centred) × cover treatment (band/tile/split/none) × wall layout (grid/cards/list) × link row
   (icons/text). Every combination is guaranteed to work; nothing else is customisable.
8. **System screens get the brand mark animation** — the two halves of the PlugMark pull apart
   (404 "unplugged") or flicker (error), with a spark between the prongs; reduced-motion
   disables it.

## Consequences

- `tokens.css` keeps the same semantic *names* (`--surface`, `--surface-muted`,
  `--surface-active`, `--text*`, `--border*`, `--color-primary`, `--color-accent`) with v2
  values, so most components restyle without edits. `--tile-*` tokens remain for the admin app
  but are deprecated on shopper surfaces.
- Radius language: pills for anything interactive; cards 18–26px; inputs 13–14px; the nav
  shell 26px. Shadows get one deep soft step for the floating pill nav.
- The old rotation-on-hover card gesture is retired; v2 hover is translate-up + accent border.
- Storybook stories and the admin app inherit the token change; admin keeps its own layouts.
