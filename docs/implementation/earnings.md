# Earnings read model — the tap projection

**Journey served:** the creator dashboard's **Earnings** tab in [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md) — "clicks and outbound taps, tied to the post that drove them: 'this reel drove 312 taps.'" The dashboard UI itself lands with auth; this is the read model it will render.

## Design

Per §6.6, taps are immutable events and **the Earnings truth is a rebuildable projection** — there are no stored counters anywhere. `EarningsReadRepository.summarize(profileId)` aggregates the `Tap` event table on demand:

- `totalTaps` — every outbound tap for the profile, including post-less surface taps.
- `byPost` — per-post counts (most-tapped first) joined with `mediaUrl`/`caption` for display. Requires `Tap.postId` (see [shopper-surface.md](./shopper-surface.md)).
- `byProduct` — per-product counts joined with the title.

## Tracked vs. estimated

Every number in this model is **tracked** — a directly measured outbound tap. "Estimated" figures exist only when a creator's affiliate network reports conversions back; v1 has **no such data source**, so the read model deliberately has no estimated fields rather than pretending. When a network-report ingest lands, its figures join here labeled `estimated`.

## Edge cases

- A post deleted after its taps were recorded: `Tap.postId` is nulled (`SetNull`), so those taps drop out of `byPost` but stay in `totalTaps` and `byProduct` — earnings history never shrinks.
- A profile with no taps returns an all-zero summary, not an error.
- Access control (Admin/Manager only) is deferred to the auth step; nothing exposes this over HTTP yet — no route or page consumes it until the dashboard lands.

## Verification

`earnings-repository.integration.test.ts` (CI `db-integration` job, real Postgres): seeds 2 taps on a hot post, 1 on a quiet post, 1 post-less; asserts ordering, totals, display joins, and profile isolation.
