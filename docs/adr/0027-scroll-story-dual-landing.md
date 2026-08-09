# ADR-0027 — The Scroll V3 Dual landing: one scroll story, three sides

**Status:** Accepted (2026-08-09) · *amends ADR-0026 (landing treatment)*

## Context

The v2 landing (ADR-0026) was a static persuade surface: a card-stack hero on
`/` plus separate `/for-creators` and `/for-business` pitch pages, all wearing
the shared shopper chrome. The design project has since produced a stronger
landing — **`docs/design/Plugfolio Scroll V3 Dual.dc.html`** — a scroll-driven
story that *demonstrates* the product instead of describing it: a sticky phone
plays the real journey (shopper: three taps to a retailer; creator: hour one
live; business: brief → agreed) as the visitor scrolls, and the three role
stories live on one page behind an instant view switch.

## Decision

1. **The landing is the Scroll V3 Dual story.** `features/marketing` renders
   one client `LandingPage` with three views. Shopper is the default on `/`;
   `/for-creators` and `/for-business` open the same page on the other sides,
   so each side stays deep-linkable with its own metadata. Switching sides in
   page runs the design's lime+violet wipe and syncs the URL with
   `history.replaceState`. The old static persuade pages for creators/business
   are retired (`/how-it-works` stays).
2. **The landing carries its own chrome.** A scroll-revealed sticky top bar
   (logo, Shopper/Creator toggle, role CTA) that appears only after the hero,
   and the design's compact single-row footer. This is the one sanctioned
   deviation from the "one shared top bar / footer on every page" rule (§7):
   the landing is a full-bleed scroll story, and AppTopBar/SiteFooter would
   sit dead inside it. Every other page keeps the shared chrome.
3. **Scroll animation is an imperative engine, not per-frame React.** One
   hook (`use-landing-scroll`) ports the prototype's `apply()`: hero fade,
   journey scrub (four steps + four phone screens), staggered reveals,
   count-ups and bar fills — all continuous functions of scroll position,
   mutating only `opacity`/`transform`/`width` on marked elements.
   `prefers-reduced-motion` renders everything at its final state and skips
   the wipe.
4. **Lime as display accent on dark marketing grounds.** The design sets the
   second headline line and the ink-panel eyebrows in Electric Lime on
   violet/ink. That loosens the strict "lime is fill-only, offer-only" rule
   (§7) *on this landing's violet/ink hero and ink panels only* — product
   surfaces keep lime for offers alone.

## Consequences

- The marketing feature is client-rendered (the story is interactive by
  nature); SEO copy still server-renders in the initial HTML, and the JSON-LD
  on `/` is unchanged.
- The design's px-precise type maps onto the named scale (§7); one `stat`
  step was added for the oversized dashboard counters.
- `/for-creators` and `/for-business` moved out of the `(public)` route group
  so they don't inherit `ShopperShell` (the landing brings its own chrome).
- The prototype file is the pixel source for this page; edits to the landing
  start there.
