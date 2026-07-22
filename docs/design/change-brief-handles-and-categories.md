# Design Change Brief — Member Handles & Categories

*Two product changes that touch existing screens. Same rules as every brief: this is the
**what & why**; visual craft is yours. Read with [`00-foundations.md`](./00-foundations.md).
Decisions behind this: [ADR-0009](../adr/0009-member-handles-and-comment-identity.md) (handles
& comment identity) · [ADR-0010](../adr/0010-per-profile-categories.md) (categories).*

---

## Change 1 — Member handles (`@handle`) & who a comment speaks as

### What changed

Every account — shopper, creator, business — now has one globally unique **member handle**,
shown as **`@handle`**. It's auto-generated at sign-in (the user never picks one during
sign-up — that flow does not change) and can be edited later in account settings. It is the
person's public name for **comments and follows**. The email is never shown anywhere.

**Keep two things visually distinct — they are different objects:**

| | Member handle | Profile username |
|---|---|---|
| Who has one | Every account | Only creator profiles |
| Looks like | `@mika_desk` inline text | `plugfolio.com/mika` — it's a URL |
| Links anywhere? | **No** — plain text in v1, never a link | Yes, to the profile page |
| How it's obtained | Auto-generated, user-editable | Chosen from verified YouTube/Instagram handles |

### Who signs a comment — a smart default plus an identity picker

Two ways a comment can be signed:

- **As a person:** display name + `@handle` — the plain treatment, most comments.
- **As a profile:** profile name + profile avatar + a **"Creator" badge**, no handle shown
  — the treatment shoppers know from owner replies on Instagram/YouTube.

Who gets to choose: a user who belongs to creator profiles (as Admin or Manager) gets an
**identity picker** on the comment form — their `@handle` plus every profile they belong
to — and may speak as any of them **on any page**, including other creators' pages.
A user with no profiles (every shopper) **never sees the picker** — the form stays exactly
as designed today.

**The default must do the right thing untouched** — this is the load-bearing design rule:

- On a page owned by one of the commenter's profiles → preselect **that profile**.
- Everywhere else → preselect their **personal `@handle`**.

So replying to your own shoppers is zero-tap correct, and speaking as a brand on someone
else's page is always a deliberate pick. The selection is **per-comment, never sticky** —
don't design an account-level "acting as" mode; that's how people post as the wrong brand
on Facebook Pages.

### Screens affected

**Creator profile page — comment list** (extends the comments section in the handoff doc):
- Replace the current `Name @user` placeholder with `Name @real-handle` for shoppers, and
  the profile-identity treatment (name + avatar + Creator badge) for team replies.
- The Creator-badge reply is the trust moment of the thread — make it quietly distinct
  (badge, not a shout). Nested replies from the creator are the common case (see the
  existing mock: "Maya Okafor" replying to Priya).

**Comment form — the identity picker:** a compact "commenting as" control on the form
(e.g. small avatar + name + chevron) that opens a sheet listing the personal `@handle`
first, then each profile (avatar + profile name). Keep it quiet — it's a safety control,
not a feature to advertise. Must scale gracefully: a Manager can belong to profiles from
several different owners, so the list may exceed 4–5 entries (scroll, don't cram).
For users with a single identity, replace the picker with plain text: *"commenting as
@handle"*.

**Account settings — new small surface:** one field, **"Your handle"** — current `@handle`,
edit → availability check → save. Errors: taken, invalid characters, too short/long.
This is the only new screen in this change; keep it a single sheet/section, not a page.

### Where comments live & how they thread (ADR-0013)

- Comments appear in **two places**: the creator's page and **each product's page** — the
  product thread is where buying questions happen ("does it fit a 16-inch laptop?").
  Posts have **no** comments in v1.
- Threads are **one level deep**: any top-level comment can take replies (indented, like
  the existing mock's Maya-under-Priya), but replies can't be replied to — don't design a
  deeper affordance. **Reply** shows only for signed-in viewers and opens an inline reply
  form (with the same identity picker); the creator's answer defaults to speaking as the
  profile.

### States to design

- Comment as a person (name + `@handle`) · comment as a profile (profile + Creator badge) —
  both in-thread, light & dark. A brand comment on *someone else's* page uses the same
  profile treatment — no special variant.
- Thread states: top-level with replies (indent treatment) · Reply closed / open (inline
  form + cancel) · product-page thread empty ("No comments yet").
- Comment form: single identity (plain "commenting as" text) · multi-identity picker
  closed / open (sheet) · long picker list (5+ identities, scrolling).
- Handle edit: idle / checking availability / taken / saved.
- Long handles and long profile names truncate; the badge never wraps away from the name.

### Components

Existing Badge (the "Creator" chip), Avatar, Input with inline validation, and a
Sheet/DropdownMenu for the picker. No new primitives beyond those.

### Out of scope — do not design

Handle profile pages (`@handle` links nowhere in v1) · a sticky account-level "acting as"
mode · brand-comment gating or moderation UI (reporting, rate-limit messaging) ·
verified checkmarks for handles · handle mentions/autocomplete inside comment bodies.

---

## Change 2 — Categories (the creator's shelves)

### What changed

A profile can group its posts and products into **categories** — each just a **title** and
an optional **description** ("Desk setup", "Budget skincare — everything under ₹500").
Categories belong to one profile; there is no site-wide category system. A post or product
sits in **one category or none**.

### Shopper side — profile page (brief 01)

- A horizontally scrollable **chips row** between the profile header and the content grid:
  **All** (default, always first) + one chip per category, in the creator's order.
- Tapping a chip filters the grid to that category; the category's **description**, when
  present, shows as one muted line under the chips row — this is the creator's shelf-talker,
  give it room but keep it one line (truncate + expand if needed).
- **All** includes uncategorized items, so nothing the creator publishes can disappear.
- A profile with **zero categories shows no chips row at all** — the page looks exactly as
  currently designed. Don't reserve empty space for it.
- Filter state should survive the share sheet (it's a `?category=` URL param — a shared
  link lands on the filtered view).

States: no categories (row absent) · active chip vs. rest · a category with no items yet
(grid empty-state: "Nothing here yet — see All") · many categories (row scrolls; "All"
stays reachable) · long titles truncate inside chips.

### Creator side — dashboard (briefs 07 & 08)

- **Assigning:** in the tagging editor (Posts) and on product rows (Products), add one
  **category select** — a simple single-select of this profile's categories + "None".
  Default is None; assignment must never feel like a required step before publishing.
- **Managing:** a small **"Categories" manage surface** reachable from the Posts and
  Products tabs (sheet or dialog, not a fifth tab): list in display order with reorder,
  add (title required, description optional), rename, delete.
  Delete confirms with *"Posts and products stay — they'll show under All."* — deleting a
  category never deletes content.
- **Both Admin and Managers** can assign and manage categories — no permission difference
  from tagging.

States: empty manage list ("Group your posts and products into shelves" + add CTA) ·
title-already-used inline error · delete confirm · select with no categories yet (offer
"New category…" inline).

### Components

Chips row (Badge/Toggle-group treatment), Select (assignment), Sheet or Dialog + simple
reorder list (management). Flag if you want a dedicated Combobox primitive for the select.

### Out of scope — do not design

Category landing pages / their own URLs · one item in multiple categories · category
cover images or icons · site-wide category browse or filtering on Explore.

---

## Priority & where this lands

Both changes ride existing P0/P1 screens: comment identity is part of the **profile page
(P0)**; categories touch the **profile page (P0)** and the **Posts/Products dashboard
(P0/P1)**. The two new small surfaces (handle editor, category manager) are P1 sheets, not
pages.
