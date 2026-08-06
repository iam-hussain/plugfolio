# `components/` — the design system's building blocks

This folder holds **two kinds of file**, kept flat and told apart by name and role
rather than by any sub-folder split:

1. **Generated shadcn primitives** — `button`, `dialog`, `sheet`, `input`, `select`,
   `badge`, `table`, … Added via the shadcn CLI and then themed with our tokens (§7).
   Kept close to upstream so a future `shadcn add` diff stays clean; they keep the
   `text-sm` scale they were generated with.

2. **Hand-authored product components** — the Plugfolio visual vocabulary:
   `ProductTag`, `CouponBlock`, `CommentThread`, and the back-room / account / dashboard
   families (`back-room-*`, `account-*`, `dash-editor-*`). These are ours, built on the
   primitives, themed entirely through tokens and CVA variants.

There is **no folder boundary** between the two — a component's kind is a fact about the
file, not its location. A component's public entry is **always the package barrel
`@plugfolio/ui`**, never a deep path like `@plugfolio/ui/src/components/…`. Some files
here (e.g. `back-room.tsx`, `account.tsx`, `dash-editor.tsx`) are thin re-export
aggregators that split one large vocabulary across concern-focused siblings while
keeping every exported name reachable from the barrel.
