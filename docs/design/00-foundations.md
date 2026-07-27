# 00 — Design Foundations

The shared visual language every page inherits. Read this before any page brief.
Source of truth for tokens and rules: `CLAUDE.md` §7 (theme) and the lean journey.

---

## Brand in one line

**The Tagged Feed** ([ADR-0016](../adr/0016-tagged-feed-theme.md)) — the daylight side of
the creator economy: a cool violet-tinted near-white canvas, oversized Sora headlines, and
real photography inside saturated colour tiles, with the product tag pinned straight onto the
post. Bright, generous, confident. Fast and legible on a phone, inside an in-app browser.

## Palette (semantic tokens — never hardcode hex in components)

| Token | Value | Use |
|---|---|---|
| `--color-primary` | Brand Violet `#7C3AED` | identity + action; links, active states, the hover of every primary button |
| `--color-accent` | Electric Lime `#C6FF3D` | **fill only, ink text** — flags a live offer, nothing else. Never a text colour. |
| `--surface` | Canvas `#FCFBFE` | the page ground (`bg-background`) — a cool near-white, never pure white |
| `--surface-muted` | White `#FFFFFF` | a *lift* — raised cards, sheets, inputs (`bg-card`) |
| `--surface-active` | Violet Wash `#EFEAFB` | eyebrow chip / selected fill |
| `--text` / `--text-muted` / `--text-faint` | Ink / Ink 2 / Ink 3 | body / supporting / captions |
| `--border` | Line `#E9E4F0` | hairlines, card borders |
| `--tile-*` | butter / mint / sky / lavender / coral / blush | content colour — the tiles photos sit in |

- **Light-committed**, dark fully supported through the same tokens (a deep violet-tinted
  canvas). The page is Canvas; **white is a lift**, reserved for objects sitting on it.
- **Lime means offer.** Electric Lime appears only where there is a real coupon/deal, always
  as a fill under ink text — never lime type on light (it fails AA). No offer, no lime.
- **Colour lives in tiles.** Saturated colour arrives as a `Tile` behind content, never as a
  text colour, a border, a gradient, or a full-bleed page wash.

## Type

- **Display / headings:** **Sora** (600–800), tracking to -0.045em. The page's one headline
  breaks to two lines, never three.
- **Body / UI:** **Manrope** (400–800), tabular figures for prices and counts. Micro labels
  are Manrope 600 uppercase.
- **One scale, defined once:** 12 / 14 / 16 (body) / 20 / 24 / 32 / 40+. Mobile uses the lower end.

## Spacing, radius, elevation

- **Spacing scale:** 4-based (4, 8, 12, 16, 24, 32, 48). Generous touch spacing on mobile.
- **Radius:** friendly, rounded (e.g. 12–16px cards, 10px inputs/buttons, pill for chips).
- **Elevation:** subtle — raised surfaces via a lighter fill + soft shadow, not heavy borders.

## Layout & responsiveness

- **Design at 360px first.** Then 768 (tablet) and ≥1024 (desktop). Creators do heavy work
  on desktop; shoppers live on mobile.
- **Content max-width** on desktop for reading comfort; public pages center a mobile-width column with room to breathe.
- **Touch targets ≥ 44px.** Thumb-reachable primary actions (bottom of viewport on mobile where possible).
- **In-app browser reality:** no reliance on hover; assume a cramped viewport with the platform's own chrome eating space; fast first paint matters more than animation.

## Components (build on shadcn/ui — see CLAUDE.md §8)

Use shadcn/ui for anything it provides; theme via the tokens above. Common ones across the app:
Button, Card, Sheet (mobile drawers), Dialog, Input, Textarea, Select, Tabs, Badge,
Avatar, DropdownMenu, Toast, Skeleton (loading), Table (dashboard). Don't hand-roll these.

- **Buttons:** primary = violet fill; the **one** high-emphasis CTA per view may use lime
  (dark text). Secondary = outline/ghost.
- **The share action** uses the **native share sheet** on mobile (Web Share API), not a custom modal.

## States — every page must specify all of these

1. **Default** (has data)
2. **Loading** (skeletons, not spinners, for content areas)
3. **Empty** (first-time / nothing yet — with a clear next action)
4. **Error** (retry path; never a dead end)
5. **Edge cases** listed per page (e.g. blocked video embed, dead affiliate link, taken username)

## Accessibility (not optional)

- Semantic HTML first; ARIA only to fill gaps. Every control labeled and focusable.
- Visible focus rings (violet, AA against surface). Keyboard path through every flow.
- Respect `prefers-reduced-motion`. Don't encode meaning in color alone.
- Contrast: body text and interactive elements meet **WCAG AA** on their surface.

## Voice / microcopy

Plain, warm, creator-native. Short. Say the benefit, not the mechanism
("Shop everything in this video," not "Product-to-content mapping"). No login-guilt on
shopper paths. Honest labels where money is involved (`tracked` vs `estimated`).
