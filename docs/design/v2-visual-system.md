# Plugfolio v2 — visual system (distilled from `Plugfolio v2.dc.html`)

*Engineering companion to [ADR-0026](../adr/0026-v2-visual-redesign.md). The prototype in the
Claude Design project is the pixel source; this file records the values it uses so the codebase
never has to re-derive them.*

## Palette

| Role | Light | Dark | Token |
|---|---|---|---|
| Canvas (page) | `#FFFFFF` | `#16141F` | `--surface` / `bg-background` |
| Surface (cards) | `#F8F7FB` | `#1F1C2B` | `--surface-muted` / `bg-card` |
| Sunk (inputs, inset fields) | `#F1EFF7` | `#272234` | `--surface-active` / `bg-active` |
| Top-bar wash (blur) | `rgba(255,255,255,.9)` | `rgba(22,20,31,.9)` | `--surface-veil` |
| Text | `#12101C` | `#F4F3F8` | `--text` |
| Muted | `#645F78` | `#A29EB4` | `--text-muted` |
| Faint | `#8F8AA3` | `#7B7690` | `--text-faint` |
| Border | `#E7E4F1` | `#2E2A3D` | `--border` |
| Border-strong | `#D6D1E5` | `#3E3854` | `--border-strong` |
| Ink (panels, nav shell) | `#12101C` | `#0E0D15` | `--brand-ink` (panel) |
| Accent (default violet) | `#7C3AED` | same | `--color-primary` |
| Accent foreground | `#FFFFFF` (ink on lime) | same | `--color-primary-foreground` |
| Offer lime (fill only) | `#C6FF3D` + ink text | same | `--color-accent` |
| Danger | `#FF6B5C` | same | `--destructive` |
| Success | `#1C7A5C` | same | `--success` |
| Nav shell bg | `#12101C` | `#16141F` | `--nav-bg` |
| Nav text | `#F4F3F8` | same | `--nav-text` |
| Nav sunk (circle buttons) | `rgba(255,255,255,.12)` | `#2E2A3D` | `--nav-sunk` |
| Nav divider | `rgba(255,255,255,.18)` | `#3E3854` | `--nav-line` |

**Creator page accents** (scoped `data-accent`, drive `--color-primary`): violet `#7C3AED` ·
indigo `#3D4EE8` · coral `#FF6B5C` · forest `#1C7A5C` · magenta `#C4247E`. Accent wash =
accent at 8% (light) / 13% (dark) — `--color-primary` with alpha.

## Type

- **Sora** — display/headlines/wordmark/prices-as-heroes. 600–700, tracking −0.03…−0.05em.
  Landing display ~78px desktop / 46px phone, line-height 0.92–0.94. Page titles 30/38px.
  Section titles 26px. Card names 15–17px.
- **Inter** — UI & body. Body 13.5–15px, line-height 1.5–1.6. Chips 12.5–13px/600.
- **Space Mono** — the label voice. Uppercase 9–11px, 700, tracking .06–.16em: eyebrows,
  micro-labels, status pills, handles, counts, coupon codes, table heads. Never body copy.

Map onto the existing named scale (`pico/nano/micro/label/copy/body/title/name…`); do not
introduce a second scale.

## Shape & elevation

- Anything interactive is a **pill** (999). Buttons: primary = accent fill + white Sora 600;
  secondary = 1px `border-strong` outline; CTA rows h-48–54.
- Cards 18–26px radius, `1px border` + `bg-card`; hover = translateY(−2px) + accent border
  (`.pf-c`). Small controls 10–14px radius. Inputs h-44–48, radius 13–14, `bg-active` fill,
  `1px border`.
- Nav shell: radius 26, `--nav-bg`, shadow `0 18px 44px -18px rgba(10,8,20,.55)`, 1px
  white-alpha border (.08 light / .14 dark).
- Menus/sheets: radius 20–26, shadow `0 24px 54px -22px rgba(10,8,20,.45)`.
- Toast: ink pill, centred above the nav (`bottom: 96px`).

## Layout

- Desktop frame `max-w-[1180px]`; inner measure `max-w-[1060px]` + 28px gutters.
- Phone: single column, 18px gutters. (The prototype's 430px frame is a canvas artefact, not
  a product rule.)
- Sticky top bar: canvas at 90% + `backdrop-blur`, 1px border-b; logo (26px PlugMark +
  19px Sora wordmark + accent spark), search circle (36px), sign-in pill / avatar pill with
  `@handle` in Space Mono 11px + caret; avatar menu 282px, radius 20.
- Bottom morphing pill nav (fixed, centred, `bottom:18px`, z-60), four modes:
  - **browse** — 5 tabs (Home/Shop/Follow/Saved/You), each 62–78px wide, active = accent fill.
  - **creator** — ← Explore · divider · Follow (accent pill) · share circle.
  - **buy** — ← back circle · save circle · Buy pill (accent; "In-store only" gets nav-sunk).
  - **dash** — Home/Traffic/Posts/Things/Collabs/Setup mono uppercase tabs.
- Chrome hidden on auth screens and the operator console; nav also hidden on error states and
  inside the dashboard on desktop (dash uses its own rail: tabs with 2px bottom accent border).

## Signature moves

- **Coupon ticket** on product view: accent border, channel eyebrow, note, lime code chip
  (Space Mono 700), dashed divider + expiry row. Expired: grey, opacity .72, code chip "—".
- **In-store only** = no Buy button; sunk card explains "the code is the action".
- **Video facade**: poster + white 64px play circle + "Watch on <provider>" pill; footer row
  "Nothing is sent to <provider> until you press play" + "Watch it there instead ↗".
- **Sponsored slot**: dashed border card, ink "Sponsored" chip with lime text, "Why this?"
  expander.
- **Share sheet**: bottom sheet, QR (25×25, always on white), copy-link row, native share.
- **404/error**: PlugMark halves pull apart with a spark (`pfPullL/R`, `pfSpark`, `pfFlick`,
  3.4s/2.4s), mono eyebrow, headline, real-creator suggestions (404) / reference code +
  "what still works" (error).
- **Auth**: chrome-free; desktop = ink left pane (40%, promises list) + form; the join screen's
  role picker is a **socket**: three 2-slot sockets, the PlugMark plug slides (`left` transition
  .28s) to the chosen one. Verify = 6 code boxes + @handle picker with availability line.
- Wall cards (creator page): grid mode = image-only tiles (radius 12, 6px gap); cards mode =
  image + caption/price body (radius 18); list = 88px thumb rows. Video badge = 24px ink
  circle play glyph, top-left; standalone product = "Thing" pill top-right.

## Motion

`.pf-t` = translateY(−1px) on hover; `.pf-c` = translateY(−2px) + accent border; transitions
.15s ease; the socket plug .28s `cubic-bezier(.2,.8,.3,1)`; reduced-motion kills all of it.

## Migration status (Aug 2026)

**On the v2 design, structurally:** tokens + preset (both themes, Inter, nav
tokens, keyframes) · chrome (top bar, account menu, morphing pill nav with the
override contract, landing footer) · landing (stack hero) · Explore (search
head, chips, v2 card chassis, dashed sponsored slot) · creator page (header ×
cover treatments, wall layouts, socials pills, shelf chips, viewer bands, pill
nav verbs) · post view (buy-mode pill) · product view (coupon ticket, buy-mode
pill) · Following/Saved framing · auth (ink pane, lime action colour, socket
picker) · 404/error (FaultMark animation).

**Added since:** the dashboard chrome (v2 rail, mono status pills, coral
danger zone, the v2 profile switcher, Things/Shelves naming) · the overview's
quick-add + needs-tagging cards · the full Traffic section (/dashboard/
traffic: range chips, the views-vs-taps chart, what-was-opened, and referrer
sources — View events now record `referrer`) · editors' sticky "What a
shopper will see" panels · the business doors and forest agreement · Support's
two-column frame · carded comments with the accent creator edge · v2
marketing primitives · cover treatment + link-row mode as **stored**
appearance axes (Profile.coverStyle/linkMode, resolved at the read) · the
admin console's Internal chip · coral accent resolved to AA (ink foreground).

**Image framing (amends ADR-0023's flow, not its pipeline):** every upload
(profile avatar, the new page cover, the member photo, post stills, thing
photos) opens the crop dialog first — drag to position, zoom to focus, canvas
crop to the kind's exact box — then uploads through the unchanged
process-watermark-store path. Profiles gained `coverUrl` (2.5:1 `cover` kind);
members gained a stored photo (`PATCH /me/image`).

**Structural migration complete.** The prototype (`Plugfolio v2.dc.html` in
the design project) remains the reference for any future polish; remaining
deltas are cosmetic judgment calls, not missing screens.
