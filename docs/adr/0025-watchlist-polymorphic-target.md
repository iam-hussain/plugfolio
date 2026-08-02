# ADR-0025 — The watchlist stores one polymorphic target, not two nullable FKs

**Status:** Accepted (2026-08-02)

## Context

The watchlist (lean journey: "Save is a shelf, not a cart") saves **two different things** —
a post and a product — into one list a shopper reads newest-first. `View` models the same
"either target" shape with two nullable foreign keys (`postId` / `productId`), so that was
the obvious pattern to copy.

It doesn't survive the uniqueness requirement. A save must be **idempotent**: in-app
browsers double-fire (§6.8), and the toggle is exactly the control that gets tapped twice.
`Follow` gets that for free from `@@unique([userId, profileId])`. The same index on
`[userId, postId]` cannot work on MongoDB (ADR-0001's datastore): a missing field is
indexed as null, so every *product* save — where `postId` is unset — collides with every
other product save by the same account. Two nullable FKs buy referential integrity and
lose the property the feature actually needs.

## Decision

- `Watch` stores **`kind` (`"post" | "product"`) + `targetId`**, both always set, with
  `@@unique([userId, kind, targetId])` — the same shape `Report` already uses for its
  four target types. `kind` is a string in the database and a **Zod enum at the boundary**,
  which is the contract (§6.4).
- **No foreign key to Post/Product.** `watchTarget` checks the target exists *and is
  publicly visible* before writing, so a bogus id never enters the list.
- **The read is the cleanup.** `listByUser` re-joins the two kinds and drops any row whose
  target has since been deleted, hidden or suspended. The list only shows doors that open.

## Consequences

- Saving twice and unsaving nothing are no-ops, at the database level, like following.
- One table, one index, two queries for the whole list (the rows, then the two kinds).
- Orphan rows accumulate for deleted content — invisible to the shopper, cheap to sweep
  later if the count ever matters. This is the price paid, deliberately.
- Adding a third savable thing (a creator page, a collab) is a new enum member, not a
  migration.

## Revisit if

- Orphans stop being cheap (a sweep job, or a delete hook in the content services).
- The list outgrows "tens of rows" and needs paging pushed into the repository — the
  `ponytail:` note on the port marks the seam.
