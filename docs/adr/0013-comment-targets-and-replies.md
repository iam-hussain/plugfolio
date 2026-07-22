# ADR-0013 — Comments live on the page and on products, threaded one level

**Status:** Accepted (2026-07-22)

## Context

Comments shipped page-level only and flat. Product decision: shoppers ask questions where
the product is ("does it fit a 16-inch laptop?"), and creators answer under the question —
so comments need a **product** target and **replies**. Posts don't get comments for now.

## Decision

- **Two targets:** a comment belongs to a **profile page** (`productId` null) or to a
  **product** (`productId` set — must belong to that profile; the service 404s a
  cross-profile product). `profileId` is always set, so page-level reads and ownership
  stay one query. **Post comments are deferred.**
- **One level of nesting:** `parentId` points at a **top-level** comment on the **same
  target**; a reply to a reply is rejected (VALIDATION) — clients only offer Reply on
  top-level comments, Instagram-style. Replies cascade with their parent; product
  comments cascade with the product.
- **Reads are threaded:** top-level newest-first, each carrying its replies oldest-first.
- Identity rules (ADR-0009) apply unchanged to replies — the picker defaults make the
  creator's answer speak as the profile.

## Consequences

- Two nullable columns (`productId`, `parentId`) + self-relation; no new tables.
- The product page gains its own comment section (reading account-free, §2.2 untouched).
- Moving to deeper threads later is a render change (the data already stores arbitrary
  parents); the one-level rule is a service policy, deliberately.

## Revisit if

- Post-level comments are wanted — add `postId` the same way.
- Deeper threads or reply-notifications matter — policy + notification plumbing, not schema.
