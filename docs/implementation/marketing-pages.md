# Marketing pages — /how-it-works, /for-creators, /for-business

Persuade surfaces (DESIGN `how-it-works.html`, `for-creators.html`,
`for-business.html`) that answer the question a stranger arriving from a bio
link actually has, before they sign up. Public and session-free.

## Routes & surface

- **`/how-it-works`** (shopper-facing): the loop shown with the real
  `ProductTag` component (not a diagram), the "what we don't ask you for" facts,
  a Tracked / Not-tracked honesty table, and an FAQ (native `<details>`).
- **`/for-creators`**: written for someone without an account yet — every door
  ends at `/join?as=creator`. Hero artefact, three steps, handle claim, the
  attribution proof, the profile/manager caps, and the "Plugfolio never handles
  your money" panel.
- **`/for-business`**: a pitch, not the product — doors end at
  `/join?as=business`. Two ways in, the paper brief, the one-thread shape, the
  facts, and the deliberate-exclusions panel.
- All three live under `app/(public)/` so they inherit the shared chrome
  (`AppTopBar` + shopper tab bar via `ShopperShell`), plus their own
  `MarketingFooter`. Built from `features/marketing` (`index.ts` is the public
  surface; `marketing-shared.tsx` holds the `mk` class vocabulary, `PostCard`,
  `Fact`, `Step`, the role-coloured `MarketingDoors` cross-link band, and
  `MarketingFooter`).

## Notes / deviations from the static design

- The cross-link doors reuse the **role colour tokens** (`data-role` +
  `bg-role-deep` / `from-role-solid`): shoppers = emerald, creators = blue,
  business = red — the same scheme as the register pane and the landing "pick
  your side" cards.
- **Lime-means-offer (§7)** is honoured over the prototype: the design used
  lime for the "Tracked" flags and the "Terms agreed" thread bubble; here those
  are violet-wash / violet, since they aren't coupons. Lime stays offer-only.
- Product close-ups use `posts/skincare.jpg` (the prototype referenced a
  `products/serum.jpg` the app doesn't ship). The "plain" tag dot maps to the
  affiliate (violet) dot — `ProductTag` has no neutral tone.
- The landing footer's "For creators" / "For business" links (previously
  `/signin` and `/collabs`) now point at these real pages.
