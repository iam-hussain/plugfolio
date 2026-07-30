# The creator dashboard — the back room

**Journey served:** "The creator's dashboard" in
[`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md).
**Design source:** `dashboard.html` (+ `post-edit.html`, `product-edit.html`) in
the design workspace, and the `THE BACK ROOM` block of its `styles.css`.

Operate mode, not Express mode. The public page is a photograph with a price
pinned to it; this is a list you scan. Dense rows, visible labels, edits that
save where you made them. Nothing here is ever seen by a shopper.

## Routes

| Route | What it is |
|---|---|
| `/dashboard` | Home — active profile, nudge, profile chips, connections, **Traffic** |
| `/dashboard/posts` | The post list, with filters and the visibility switch |
| `/dashboard/posts/[postId]` | The post editor — media, shelf, tagged products, tag form, its own traffic |
| `/dashboard/products` | The library — search + rows, each linking to its product page |
| `/dashboard/products/[productId]` | The product page — link, coupon, shelf, its own traffic, delete |
| `/dashboard/categories` | Shelves: add, rename, reorder, delete |
| `/dashboard/collabs` | The collab list + the open requirement board |
| `/dashboard/settings` | Identity, appearance, links, connections, Managers, danger zone |

## The shell

`layout.tsx` renders `DashboardShell` **once** — mark, profile switcher, tab
row. "Screens never invent their own header" only holds if there is one header,
and post/product editing being their own routes is exactly how a shell forks
into three copies.

The layout deliberately does not resolve the active profile: a Next layout never
receives `searchParams`, and `?profile=` is where the active one lives, so both
the switcher and the tab row read it from the URL. A detail route lights its
**parent** tab — the post editor is a Posts route, not a seventh section.

## Where things live

Every shape is in `@plugfolio/ui` (ADR-0018), split three ways:

- **`back-room.tsx`** — shell, page head, cards, fields, pills, icon actions,
  connections, the nudge, the danger zone.
- **`dash-rows.tsx`** — the four dense row types (post, product, category,
  collab).
- **`traffic.tsx`** — stats, provenance badges, the ranked lists.

Behaviour stays in `apps/web/src/features/product-tagging` (and `traffic` for
the summary view): mutations, forms, and the interactive wrappers.

## Decisions worth knowing

**Posts are a list, not a grid.** The grid showed the photograph, which the
creator already recognises. What they open the tab to check is in words — is it
on the page, which shelf, how many products — and words want rows.

**The visibility switch sits in the row.** "Hide from page" as a button made you
read the label to learn the current state; a switch shows it. In the row rather
than two screens away in the editor, so five posts can come down without opening
five pages. A hidden post is dimmed, not removed: still yours, still listed,
still editable — only its public URL is gone.

**The library lists; the product page edits.** Inline link, coupon and shelf
editors used to sit in the library row. That meant two screens could each claim
to be where a product is changed, and it made the list into the CRM the design
says it must not become.

**Untagged carries the colour.** Lime marks a real live thing needing action —
work waiting (`untagged`), a reply owed (`new`), an offer running (`code`). Not
decoration, and never as type (§7).

**Reorder is arrows, not drag.** Five shelves in a list don't earn a
pointer-events implementation, and arrows work on a phone and with a keyboard,
which a drag handle does not. A move swaps two `sortOrder` values.

**"Needs a reply" is derived, not set.** `CollabSummary.lastMessageFromUserId`
compared against the viewer — a real fact about the thread, rather than a status
somebody has to remember to change.

**The Admin/Manager boundary is shown, never hidden.** A Manager sees the field,
sees the label saying it is Admin-only, and sees it disabled. Hiding it would
leave them wondering what they are missing.

## Traffic

Views, taps, code copies and the rate between the first two — see
[traffic.md](./traffic.md) and [ADR-0021](../adr/0021-view-events.md). The same
figures appear on the post page and the product page, beside the thing that
earned them.

## Verification

- Storybook: `UI/Back room` covers the page header, Home, Traffic, all four row
  types, Settings and the empty state.
- The tabs are exercised end to end in the browser: the view beacon writes a
  `View` row and the Traffic card reads it back.

## Not built here

- **Add post is still a dialog.** The design moved it to
  `post-edit.html?mode=new`; the dialog holds the same fields and is one screen
  fewer. Worth revisiting when the media-kind and shelf pickers land there.
- **No time range on Traffic.** All-time only, as the design shows.
