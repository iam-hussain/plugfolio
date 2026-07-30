# ADR-0020 — The sponsored slot is admin-placed, and never a plan

## Context

The Explore design carries one sponsored slot (`explore.html §.adslot`). Two
things about it needed deciding before any of it could be built.

**First, how an ad gets there.** The design hides the slot with
`body:not([data-plan="free"])` — a paid *Pro* plan removes ads. That implies
subscriptions, billing and a plan model, and §2.3 is a golden rule: *v1 handles
no money; do not add payment rails without a doc change.* Building the plan to
build the slot would have inverted the priority — monetisation machinery in
service of one component.

**Second, what an ad is allowed to look like.** The shopper surface's whole
premise is that a creator's recommendation is trustworthy. An ad that wears the
same clothes as a recommendation borrows that trust, and the shopper has no way
to tell them apart. This is the actual risk in the feature; the revenue model is
not.

## Decision

**A sponsored placement is a row an operator creates in the admin app, shown
when an admin turns the `ads` flag on.** No plan, no self-serve purchase, no
billing — deals are agreed off-platform like everything else in v1 (§2.3).

- **Off by default.** The `ads` feature flag defaults to `false`, so the slot
  does not exist until an operator deliberately enables it. Every other flag
  defaults on; this one is the exception, because "we forgot it was on" is a
  much worse failure for an ad than for comments.
- **One slot per page**, breaking the wall rather than sitting inside it, with a
  cadence of one per "Load more" batch rather than one per scroll-depth — which
  is how ad load quietly becomes unbounded.
- **It must never be mistakeable for a recommendation.** No tilt, no tag pill,
  no tabular price, no Buy label, square-shouldered against a wall of 26px
  cards, labelled `Sponsored`, and carrying a real "Why this?" disclosure. Those
  are enforced by the `AdSlot` component, not by whoever writes the next page.
- **No targeting, no tracking.** A placement is shown to everyone or to nobody.
  There is no profile to target against — the shopper surface is account-free
  (ADR-0002) — and building one to sell ads against would be the single most
  expensive thing v1 could do to its own promise.
- **Data:** `AdPlacement` — `title`, `description`, `imageUrl`, `url`,
  `activeFrom`/`activeUntil`, `createdAt`. Managed in the admin app under the
  existing operator model (ADR-0014), audited like every other admin write.

## Consequences

- Selling is manual and does not scale — deliberately. When it needs to scale,
  that is a decision with its own ADR, and it will have to answer the targeting
  question this one avoids.
- Because there is no plan, there is no "remove ads" upsell anywhere in the
  product, and no creator sees a paywall on their own page.
- The slot is dead weight until an operator places something and flips the flag.
  That is the correct default: an empty ad slot is invisible, and an unwanted
  one is not.

## Status

Accepted. Recorded in `plugfolio-lean-journey.md`; the component's rules live in
`docs/implementation/explore.md`.
