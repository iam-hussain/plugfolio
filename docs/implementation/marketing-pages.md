# Marketing pages — the landing (/, /for-creators, /for-business) and /how-it-works

Persuade surfaces, public and session-free. The landing is the **Scroll V3
Dual scroll story** (design `Plugfolio Scroll V3 Dual.dc.html`, ADR-0027);
`/how-it-works` stays the shopper explainer (DESIGN `how-it-works.html`).

## The landing — one scroll story, three sides

- **`/`** opens the **shopper** side (the default): hero ("Tap the post. Own
  the thing."), the 420vh phone journey (tap her link → tap the product → buy
  at the retailer → zero accounts made), the card's three faces, the optional
  account band, and the violet claim panel → `/explore`.
- **`/for-creators`** opens the **creator** side: "You post. Your page
  sells.", hour one live on the phone, the five-minute setup rewind, the
  dashboard peek (count-up taps/copies, top-things bars), own products +
  collabs, and the handle-claim panel → `/join?as=creator`.
- **`/for-business`** opens the **business** side (linked from the landing
  footer): "Creators sell it better than ads.", brief → agreed on the phone,
  the two doors, the never-do ink panel, and the ink claim panel →
  `/join?as=business`.
- All three routes render the same `LandingPage` from `features/marketing`
  with a `defaultRole`; the top-bar toggle and footer links switch sides in
  place behind the lime+violet wipe and sync the URL via
  `history.replaceState`. Reduced motion skips the wipe and renders scroll
  states final.
- The landing carries **its own chrome** (scroll-revealed top bar + compact
  footer, ADR-0027) — the one deviation from the shared AppTopBar/SiteFooter
  rule. The two role routes therefore live *outside* `(public)` so they skip
  `ShopperShell`.

### Feature layout (`features/marketing/`)

- `landing-page.tsx` — role state, wipe, URL sync, top bar, view switch.
- `landing-view-{shopper,creator,business}.tsx` — one file per side.
- `landing-hero.tsx` / `landing-journey.tsx` / `landing-cta.tsx` — the three
  shared section shapes (150vh hero, 420vh phone scrub, claim panel + footer).
- `landing-screens-*.tsx` — the four phone faces per side.
- `landing-bits.tsx` — pill/eyebrow CVAs, `Band`, `CodeChip`, `RoleBadge`.
- `landing-chrome.tsx` — the scroll-revealed top bar + landing footer.
- `hooks/use-landing-scroll.ts` — the imperative scroll engine (a port of the
  prototype's `apply()`), driving `data-lp` / `data-step` / `data-scr` /
  `data-rev` / `data-count` / `data-bar` elements.

### Notes / deviations from the static design

- Type/colour map onto the token scale (§7): the design's px sizes land on
  `pico…title` + display steps (one new `stat` step for the 52px counters);
  `#F5F4F8`→`bg-muted`, `#EFEAFB`→`bg-brand-violet-wash`, off-white text on
  violet/ink → `text-white/…` tiers.
- The design's footer "Privacy" link has no route yet, so the footer links
  are Explore · For business (side switch) · How it works · Support &
  feedback.
- Images are local (`/landing/posts/fashion|store|scrunchies.jpg`, existing
  avatars) via `next/image` — no Unsplash hotlinks.
- The design's dead `timer`/`tfill` hooks (left over from the single-role
  scroll prototypes) are not ported.

Stories: `Landing/Scroll story` (all three sides + the shared pieces).

## /how-it-works

Unchanged (DESIGN `how-it-works.html`): the loop shown with the real
`ProductTag`, the "what we don't ask you for" facts, the Tracked/Not-tracked
honesty table, and a native-`<details>` FAQ. Lives under `app/(public)/` so it
inherits the shared chrome, and is built from `features/marketing`
(`marketing-shared.tsx` holds the `mk` vocabulary, `PostCard`, `Fact`, `Step`,
`MarketingDoors`).

The persuade vocabulary in `@plugfolio/ui` (`LoopSteps`, `RetailerFrame`,
`Faq`, `HandleClaim`, `ProofRow`, `LimitPanel`, `BriefCard`, `CollabThread`,
`Exclusions`) still serves `/how-it-works`; the rule stands: **show the real
component rather than describing it.**
