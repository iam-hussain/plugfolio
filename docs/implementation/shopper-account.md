# Shopper account — follow and comment

**Journey served:** "the one optional account" in [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md) — a shopper signs in (email, same Auth.js flow as everyone, [ADR-0007](../adr/0007-authjs-identity-tables.md)) **only** to follow a creator, save something for later, or comment on their page. Buying never asks. Follow, save and comment are the *only* things behind this door in v1 (§2.2). The watchlist has its own note: [`watchlist.md`](./watchlist.md).

## Data model

Migration `20260720100000_follows_and_comments`:

- `Follow` — composite PK `(userId, profileId)`; the PK itself makes follows naturally idempotent. Cascade both ways.
- `Comment` — `profileId` (always the owning page) + nullable `productId` (set = a product comment) + nullable `parentId` (set = a reply; one level only, parent must be top-level on the same target — ADR-0013), `userId`, `asProfileId` (ADR-0009), `body`. Post comments deferred. Replies cascade with their parent; product comments with the product.
- A "shopper account" is just a `User` row with no profiles — no separate table, per ADR-0004's one-login model.

- `User.followingSeenAt` — the last time this account opened `/following`. Unset = never, which reads as "everything is new". The only field the "N new since you last looked" counts need; no per-creator read state, no notification table. (Optional field on MongoDB, so nothing to migrate.)

## API surface

- `POST /api/follows` `{profileId}` → 201 · `DELETE /api/follows/:profileId` → 200 (idempotent no-op if not following) · `POST /api/comments` `{profileId, productId?, parentId?, asProfileId?, body ≤500}` → 201 (cross-profile product or mismatched parent → 404; reply-to-reply → 400).
- All three: session required (401 `UnauthorizedError` otherwise); the actor is **always** `session.user.id`, never a body field. Unknown profile → 404.
- Reads have no endpoints: the public page server-renders comments (`getComments`, latest 50) and follow state; `/following` renders the followed-creators list — the payoff, with the rich feed still deferred.

## Surfaces (themed, per brief 04 + the shopper chrome)

- `/following` — the followed-creators list (DESIGN `following.html`). Rows, not cards in a grid: avatar, name, `@username`, `N posts · N things · followed X ago`, a state badge, and the unfollow control. Grouped into **New since you last looked** and **Everyone else**, above a `Last looked N days ago` chip — the denominator every count is measured against. With nothing new there is **one** group, titled "Everyone you follow", and **no panel announcing it**: the title and each row's "Nothing new" badge already say it, and a block of chrome describing an absence is worse than the absence. Search (within your follows only) + sort (most new / recently followed / longest followed / A–Z) + `?page=` paging, all in the URL so a reloaded link lands on the same list. Four states: some new · nothing new · no match · following nobody. A creator with no display name shows the handle **once** — name and handle lines were both `@lena`.
  - **The spec line, walked and not crossed:** v1 has no aggregated feed, so nothing merges anyone's posts into a stream. "3 new since you last looked" is a fact about a *row*; every route out goes to that creator's own page, which is where buying happens. Recorded in the lean journey's deferred table.
  - **Counts are measured, not modelled:** visible `Post.createdAt` against `User.followingSeenAt`. The visit is stamped *after* the read, so what's on screen is measured against the previous visit.
  - **Unfollow is undo, not "are you sure?"** The row stays, dimmed, with Undo until the page is left — that's what makes a confirm dialog unnecessary rather than merely skipped (you can't re-follow someone you can no longer find in a list of hundreds). Optimistic; a failed call puts the row back and says so.
- **The top-bar account menu** (`components/chrome/account-menu.tsx`) — the pill carries the
  account's own `@handle`, not a mode name: on a shared bar the one thing worth confirming is
  *who you are signed in as*. The dropdown opens on that identity — `@handle` + a **Shopper**
  tag (every account shops, §2.2, so it is a tag and never a row to pick), then the full name
  and the email — and then lists only hats actually held: creator profiles with their role, a
  business **if one exists**. There is deliberately **no "Create a business"**: wanting one is
  `/support?category=business_account` — the **one** door to setting one up, here and on
  `/account`, so an operator reads who is hiring before a Business row exists.
- `/account` — the one settings page every role shares, rebuilt as **one destination at a time**
  (it used to be five sections in a single scroll, which on a phone meant travelling past
  everything you weren't there for). Three parts: a **hero** — the account's one saturated
  moment, a lavender `Tile` carrying the avatar, `@handle`, the role on a white tag pill
  (the product tag's shape borrowed for a person) and name · email; an **index** of the five
  destinations, each with a hue dot and **the value it currently holds** (`@handle`, the
  email, "1 of 5 profiles · Acme", "Google connected"); and the **panel** you opened.
  - **Two shapes, one tree** (`AccountShell`, the only client part): on a phone the header +
    index and the panel take turns — opening one hands it the whole screen, "All settings"
    brings the index back; from 900px the index is a sticky rail beside the panel and the
    header always shows. No duplicated markup, so no duplicate ids and no second copy of a form.
  - Selection is **local state, not the URL** — switching is instant, no round-trip. The cost
    is deep links to a section; `ponytail:` marked at the source.
  - Panels are server-rendered and passed in as props (one carries a server action), so the
    shell only decides what is on screen. Each panel is still its own file under `account/`
    and now renders its payload only — the title and lead moved to the destination list, so
    the index row and the panel head can't drift apart.
  - Hues come from `ACCOUNT_TONES`, assigned **by position** (§7's tile rule), which gives the
    page a stable spatial memory: Connections is always mint, Leaving always coral.
  - Sections: **You** (name · member handle, edited inline via `HandleForm` · photo),
    **Signing in** (email → `/support?category=change_email`; **username**, which since
    ADR-0024 is a second way in; password → `/forgot`; locked out →
    `/support?category=lost_email_access`), **Your roles** (Shopping always on; Creator with
    the 5-profile cap stated or the connected-social prerequisite; Business linking
    `/collabs`, or — with none — `/support?category=business_account`, the one door to setting
    one up), **Connections** (Google · YouTube live, Meta · Instagram not available yet), and
    **Leaving** (sign out; deletion → `/support?category=delete_account`, a person not a
    button).
  - Account-level only. A profile's public details, links and Managers stay at `/dashboard/settings`, Admin-gated per profile.
  - Name and photo are read-only in v1 — they arrive from the connected social, and an uploader waits on media storage. Everything else on the page is a real action.
  - The "Connected" chip is violet-wash, not lime: lime is offer-only (§7), so the design's lime pill would break the rule.

## Components (feature `shopper-account`)

- `FollowButton` (client) — signed-out: the inline claim sheet; signed-in: an **optimistic** toggle — the label flips on the tap and reverts (with a "didn't save" line) if the write fails, while `router.refresh()` brings the follower count and the page's second Follow copy along behind it. Server state stays the truth: the local override drops itself as soon as the refreshed prop agrees. It renders straight from the prop before, which meant a tap changed nothing until a round-trip plus a full RSC re-render — long enough on a phone to read as dead and be tapped twice.
- `FollowingPage` (server, presentational) — the `/following` composition; the route reads (`getFollowingList`, then `markFollowingSeen`) and passes the rows in. Grouping, the "N days ago" phrasing and the badge wording are pure functions here, formatted server-side so nothing drifts between server and client render. `FollowRow` (client) owns the optimistic unfollow/undo over the design system's `FollowRowShell`/`FollowIdentity`/`FollowBadge`, and the group + "last looked" chip are `FollowGroup`/`LastLooked`; `FollowingControls` (client) writes search + sort to the URL, debounced.
  - `getFollowingList` (core) does search, sort and paging in memory: the repository hands back the whole list because a follow list is hundreds, not millions, and sorting by a computed "new" count in SQL costs a view. `ponytail:` marked at the port — push it down if someone follows thousands.
- `AccountPage` (server, presentational) — the `/account` composition; the route fetches (handle, profiles, business, YouTube connection) and passes them in, which is also what makes the page storyable. Its vocabulary now lives in `@plugfolio/ui` ([ADR-0018](../adr/0018-design-system-in-ui-package.md)): `AccountNav`, `AccountSection`, `SettingRows`/`SettingRow`, `RoleBlock`/`RoleCopy`/`Prerequisite`, `ProfileRow`/`ProfileNewRow`, `ConnectionRow`. Role hues come from the `data-role` tokens (`bg-role-deep`) — no colour is written in the components.
- `CommentForm` (client) — signed-in only; 500-char cap mirrors the Zod schema. Carries the ADR-0009 identity picker for profile members (see [member-handles-and-categories.md](./member-handles-and-categories.md)).
- **Comment reactions** — `CommentReaction` (`@@unique([commentId, userId])`, so a double-fired tap in an in-app browser is one row and changing your mind is an update). `POST /api/comments/:id/reaction` with `{value: "helpful"|"unhelpful"|null}`; null clears, which is what tapping the one you already picked sends — the toggle stays the server's contract. Behind the same account door and the same admin kill switch as commenting; reading the counts is account-free. `CommentReactions` (client) is optimistic and puts the count back on failure.
- `CommentList` (server) — account-free reading of one-level threads (replies indented, oldest-first); a comment is signed by the author's `@member-handle`, or by the profile + Creator badge when it speaks as one (ADR-0009) — **the author's email is never rendered** (privacy). `ReplyToggle` (client) shows Reply for signed-in viewers and opens an inline `CommentForm` with `parentId`. The product page renders its own thread via `getProductComments`.

## Edge cases

- Double-fired follow (in-app browsers, §6.8) collapses via upsert on the composite PK; unfollow uses `deleteMany` so an already-gone row is a quiet no-op.
- Comment body is trimmed and 1–500 chars at the boundary; empty submissions are disabled client-side and rejected server-side.
- The creator page stays account-free: a session only *enriches* it. `auth()` on the public page costs nothing for anonymous visitors (no session cookie → no DB hit).

## Verification

- Unit: `shopper-social.test.ts` — idempotent follow, unknown-profile 404s, quiet unfollow, comment add/reject. `following-list.test.ts` — the four sorts, search across handle and display name, paging that keeps its total, and "read against the previous visit, then stamp this one".
- Storybook: `Shopper/Account` — shopper-only, needs-a-connection, creator, all-three-roles, connect-not-configured. `Shopper/Following` — some-new, all-caught-up, paged, no-match, following-nobody.
- e2e: anonymous page shows comments + Follow door with no wall; `POST /api/follows` and `POST /api/comments` return 401 anonymous; all prior shopper journeys unchanged.
