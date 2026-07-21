# ADR-0010 — Categories are per-profile shelves, one per item

**Status:** Accepted (2026-07-21)

## Context

Creators need to group posts and products into browsable shelves ("Desk setup", "Budget
skincare") on their public page. The two classic shapes are a **site-wide taxonomy**
(needs moderation, gets stale, invites SEO spam) and **per-creator curation** (costs
nothing, always reflects the creator's own merchandising). Multi-category membership
(join table) and category landing pages are possible extensions.

## Decision

- **`Category` belongs to a profile:** `(profileId, title, description?, sortOrder)`,
  title unique per profile. No global taxonomy.
- **One optional category per item:** nullable `categoryId` on `Post` and `Product`,
  `ON DELETE SET NULL` — deleting a category never touches content; items fall back to
  "All". No join table in v1.
- **Public page:** category chips filter the grid via a `?category=` param (shareable, no
  dedicated URLs). "All" is the default and includes uncategorized items; a profile with
  zero categories renders exactly as today (no chips row).
- **Permissions:** Admin **and** Managers manage categories — it's content curation, the
  same tier as posting/tagging in ADR-0004's role table.

## Consequences

- Smallest possible model: one table, two nullable FKs. Upgrading to many-to-many later is
  a mechanical migration (FK → join table) that doesn't change the public UX.
- Category assignment lives where content is edited (Posts / Products dashboard tabs), so
  no new dashboard tab is needed — just a small manage-categories surface.
- Filtering happens on an already-loaded profile page; no new endpoints for reads.

## Revisit if

- Creators genuinely file one item on multiple shelves → join table.
- Categories deserve SEO-able URLs (`/<username>/c/<category>`) → landing pages + slug
  rules.
