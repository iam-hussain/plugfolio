# ADR 0002 — No-Login Shopper Identity

**Status:** Accepted

## Context

A golden rule (`plugfolio-lean-journey.md`, CLAUDE.md §2): **shopping never requires
an account.** Yet some shopper actions need continuity or identity:

- **Outbound tap / click attribution** — tie a tap to the creator and source post.
- **Follow and comment** — the two social actions that *do* require a shopper account.

We need an identity model that keeps buying fully anonymous while still supporting
attribution and the optional social account.

## Decision

Use a **layered identity ladder**, never a login wall on a shopping path:

1. **Anonymous device token (default).** On first visit, issue a signed, HTTP-only
   device token (a cookie). It is **not** a user record — it exists only to make taps
   idempotent and attributable. No PII, no account.
2. **Attribution events are append-only.** A tap writes an immutable event
   (`deviceToken`, `creatorId`, `postId`, `source`, `ts`). Earnings are a projection
   over these events, labeled `tracked` vs `estimated` — never a mutated counter.
3. **Shopper account (opt-in, email magic-link).** Created **only** when a shopper
   chooses to follow or comment. Buying, browsing, and coupon-grabbing never trigger it.
4. **Ladder:** anonymous device → claimed shopper (follow/comment) → creator/business.
   No rung below "account-required" ever blocks shopping.

## Consequences

- **Positive:** the no-login promise is architecturally enforced, not just UI policy;
  attribution works for fully anonymous shoppers; append-only events make Earnings
  rebuildable and auditable; the social account is additive, not a gate.
- **Trade-offs:** device tokens are per-device (a shopper on two devices is two
  anonymous identities until they claim an account) — acceptable, and resolved by the
  magic-link claim; append-only events need a projection/rollup step for reads.
- **Revisit if:** cross-device continuity for anonymous shoppers becomes a v1 need
  (it is deferred today), or rewards/wishlist (deferred) require attaching value to a
  device token — both are extensions of this model, not replacements.
