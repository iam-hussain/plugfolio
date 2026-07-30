# Traffic read model — the view / tap / copy projection

**Journey served:** the creator dashboard's **Traffic** card in
[`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md), and the same
figures shown on a post and on a product where the thing that earned them is.

*Supersedes `earnings.md`.* The card was called **Earnings** until it was
pointed out that it earns nothing: Plugfolio handles no money and sees no sale
(§2.3), so the word promised a number this product cannot produce. What it
actually holds is measured counts — who looked, and who left for a retailer.

## The three events

All three are append-only (§6.6). The projection is rebuildable from them; there
are no stored counters anywhere.

| Event | Recorded when | Table |
|---|---|---|
| **View** | a shoppable surface opens — the creator page, a post page, a product page | `View` |
| **Tap** | someone leaves for a retailer | `Tap` |
| **CodeCopy** | someone copies a coupon code (ADR-0011) | `CodeCopy` |

`View` is new — see [ADR-0021](../adr/0021-view-events.md) for why it's a client
beacon and why it never carries a `profileId` from the client.

## Why views and taps are never shown apart

Either alone misleads. 1,284 taps sounds enormous until you see 20,410 views,
and 20,410 views sounds like reach until you see how few moved. So the card
shows both plus the rate between them — **tap-through** (`taps ÷ views`, one
decimal) — which is the only one of the three a creator can act on.
`tapThroughRate()` returns `null` at zero views: no rate is a different claim
from 0%.

## The read model

`TrafficReadRepository.summarize(profileId)` aggregates all three tables on
demand:

- `totalViews` / `totalTaps` / `totalCodeCopies` — every event for the profile,
  including surface-level ones with no post or product.
- `byPost` — per-post `views` + `taps`, most-tapped first, joined with
  `mediaUrl`/`caption` for display.
- `byProduct` — per-product `views` + `taps` + `codeCopies`, joined with the title.
- `byCode` — coupon codes by copies, carrying `inStoreOnly` so a code with no
  link to tap says so.

## Tracked vs. estimated

Every number here is **tracked** — a directly measured event, and it wears that
label in the UI (`Provenance kind="tracked"`). Code copies wear
**redemption not tracked** instead, because a copy is a count we hold that is
not the thing a creator actually wants to know: redemption happens at the
retailer, where Plugfolio cannot see it.

"Estimated" figures exist only when a creator's affiliate network reports
conversions back. v1 has **no such data source**, so the read model has no
estimated fields rather than pretending — a plausible number here would be the
one dishonest thing in the product.

## Edge cases

- A post or product deleted after its events were recorded: the id is nulled
  (`SetNull`), so those rows drop out of `byPost`/`byProduct` but stay in the
  totals — history never shrinks.
- A post can have views and no taps, and a product can have copies and no taps
  (in-store-only coupons). Each still gets a row.
- A profile with nothing measured returns an all-zero summary, not an error, and
  the card renders two zeroes and a way to change that rather than five empty
  panels.
- A coupon cleared after its copies were recorded has no code to name, so it
  drops out of `byCode` while its copies stay in `totalCodeCopies`.

## Verification

- `record-view.test.ts` — profile derivation from all three surfaces,
  idempotency, and a 404 for a target that doesn't exist.
- `traffic-repository.integration.test.ts` (CI `db-integration` job, real
  database): seeds views and taps across two posts, a product and the page
  itself; asserts ordering, totals, display joins and profile isolation.
