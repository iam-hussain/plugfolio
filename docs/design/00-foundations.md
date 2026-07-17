# 00 — Design Foundations

The shared visual language every page inherits. Read this before any page brief.
Source of truth for tokens and rules: `CLAUDE.md` §7 (theme) and the lean journey.

---

## Brand in one line

**Charged Violet** — confident, modern, creator-native. A violet-tinted dark world with
one disciplined electric-lime spark. Fast and legible on a phone, inside an in-app browser.

## Palette (semantic tokens — never hardcode hex in components)

| Token | Value | Use |
|---|---|---|
| `--color-primary` | Charged Violet `#7C3AED` | Primary brand, buttons, links, active states |
| `--color-accent` | Electric Lime `#C6FF3D` | **Sparingly** — the single CTA highlight, key emphasis. Never a background. |
| `--surface` | violet-tinted dark (e.g. `#151221`) | App background (dark-first) |
| `--surface-raised` | one step lighter | Cards, sheets, inputs |
| `--text` / `--text-muted` | near-white / muted violet-grey | Body / secondary text |
| `--border` | low-contrast violet-grey | Dividers, input borders |
| `--danger` / `--success` | red / green (AA on surface) | Errors, confirmations |

- **Dark-first**, but tokens must resolve cleanly in **light mode** too. Design both.
- **Lime is a spark, not a field.** One lime element per view at most. **AA warning:**
  lime-on-white fails contrast — never put lime text on light; use lime as a fill behind
  dark text, or as an accent on dark surfaces.

## Type

- **Display / headings:** a geometric display face (e.g. a Space Grotesk / similar). Confident, tight.
- **Body / UI:** a clean sans (e.g. Inter). Highly legible at small sizes.
- **One scale, defined once:** e.g. 12 / 14 / 16 (body) / 20 / 24 / 32 / 40. Mobile uses the lower end.

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
