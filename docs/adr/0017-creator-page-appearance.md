# ADR-0017 — Creator page appearance is a bounded set of choices, not a theme editor

## Context

A creator page is the creator's shopfront, and creators asked for it to look like
theirs rather than like ours. The obvious answer — let them pick colours and
arrange the page — is the one that breaks the product:

- An unconstrained accent lets a creator choose a colour that fails WCAG AA behind
  the white label on their own **Buy** button. The buy path is the product; a
  creator must not be able to break it by picking a nice pink.
- Free layout means every page is a different page. The shopper's whole loop —
  see a tag, tap it, land on the retailer — depends on the page reading the same
  way everywhere.
- A theme editor is also a maintenance surface: every new component has to be
  checked against every possible creator setting.

The design (`../plugfolio-design/creator-prefs.js`) settles this as a small set of
named options, and states the contrast measurements for each accent. It also says
where the controls live: *"§5.23 lives in Settings"* — the page's own **Customise**
button is a door into the profile's settings, not a second editor.

## Decision

Creator page appearance is **four enums on the Profile**, nothing more:

| Field | Values | Default |
|---|---|---|
| `accent` | `violet` · `indigo` · `coral` · `forest` · `magenta` | `violet` |
| `headerStyle` | `compact` · `balanced` · `centred` | `balanced` |
| `gridStyle` | `grid` · `cards` · `list` | `grid` |
| `greeting` | free text ≤ 80 chars, or unset | unset |

- **The accent list is closed and measured.** Contrast against white label text:
  violet 5.70, indigo 7.90, coral 5.09, forest 6.50, magenta 6.28 — all pass AA.
  A creator cannot express a colour outside this list, so no setting can break the
  Buy button.
- **Accents ship as tokens, not as values.** Each is a `[data-accent="…"]` block in
  `@plugfolio/tokens` overriding `--color-primary`, exactly like the existing
  `[data-role]` blocks. The page sets one attribute; every component keeps reading
  `--color-primary`. **No inline `style`, no runtime-built class strings** (§8) —
  which is only possible *because* the set is closed.
- **Header and grid are layout variants of the existing components**, selected by a
  CVA variant — not separate components and not a layout engine.
- **The controls live in two Admin-gated surfaces that share one form:**
  `/dashboard/settings`, and an in-page **Customise drawer** on the public page
  itself. *(Revised 2026-07 — this ADR first had the page's Customise button
  merely link to Settings, "not a second editor". It now opens a drawer over
  the live page. The reversal is safe precisely because the control set is
  closed and measured: the drawer can express nothing Settings can't, so it
  adds no surface to maintain — it's the same editor, opened against the page
  it edits, which is the truest preview.)*
- **The choices belong to the profile, not the account.** One account can hold five
  profiles; each is its own shopfront.

## Consequences

- Adding an accent means adding a token block and an enum value, and measuring its
  contrast — deliberately a small, reviewable act rather than a settings toggle.
- Every shopper-facing component stays token-driven; nothing needs to know a
  creator picked coral.
- Grid `cards` and `list` render the post caption and the action word, which the
  tight `grid` layout has no room for. That copy is therefore load-bearing in two
  of three layouts — a post with no caption falls back to its handle.
- What we are *not* building: custom fonts, custom backgrounds, section reordering,
  free colour entry, or per-post styling. Those are the theme editor this ADR
  exists to avoid.

## Status

Accepted. Implements the appearance half of `docs/implementation/shopper-surface.md`;
recorded in `plugfolio-lean-journey.md` under the creator journey.
