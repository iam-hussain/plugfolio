# Support requests — user↔operator contact

**Journey served:** any of the three roles (creator, shopper, business) — **and completely
signed-out visitors** — contact the operators about a known issue (lost email, change email,
merge accounts, password trouble, username/impersonation, connection trouble, collab dispute,
delete account) or anything else. Deliberately account-free: the top issue is "I lost access
to my email", which means the person *cannot sign in*. Replies happen by email; there are no
in-app threads in v1.

## Data model

Migration `20260724…_support_tickets`: `SupportTicket` — `category` (enum), `message`,
`contactEmail` (the **reply** address, asked explicitly since the account email may be exactly
what's broken), `requesterLabel` (denormalized `@handle` or "Anonymous visitor", like
`Report.reporterLabel` — the queue never joins a deletable account), `status` (open →
resolved/dismissed), `createdAt`/`resolvedAt`. Indexed `(status, createdAt)`. Append-only
inflow, no threading. `SupportTicketCategory` / `SupportTicketStatus` enums.

## Services (`support.ts`)

- `createSupportTicket(deps, input, { handle })` — the inflow; labels by handle or anonymous.
- `listSupportTickets` / `resolveSupportTicket` / `dismissSupportTicket` — the operator queue.
  Closing records an audit entry (`support.resolve` / `support.dismiss`, detail = category +
  contact email) and 404s an unknown id. Mirrors `reports.ts` + `admin-reports.ts`.

## API surface

`POST /api/support` `{category, message, contactEmail}` — **session-optional** (a session only
enriches the ticket with the member's `@handle`); behind the `support` feature flag (default
on, so an operator adds `support=off` to switch it off — same as `reports`). Admin reads/writes
go direct via `@plugfolio/core` (ADR-0014), no admin endpoints.

## Surfaces

- **`/support`** (web, public — a static segment under `(public)`, and `support` is in
  `BASELINE_RESERVED_USERNAMES` so no creator handle shadows it): category picker with a
  per-category hint line, message box, and an always-asked contact-email field (prefilled from
  the session but editable). Success state confirms which address we'll reply to.
- **Entry points:** the sign-in page ("Can't access your email?" → `?category=lost_email_access`),
  the forgot-password page ("Lost the inbox itself?"), the shopper Account page, the business
  home chrome, and the landing footer.
- **Admin `/support`**: the triage queue (mirrors `/reports`) — category badge + message,
  a `mailto:` contact link, requester label, age, status filter, Resolve / Dismiss. Operators
  act using the existing member/profile/collab tools and **reply by email**.

## Deliberately out of v1

In-app reply threads, attachments, ticket assignment/SLA, and **self-serve email change**
(a verify-new-address auth flow — worth doing later; the support ticket covers it manually
until then).

## Verification

- Unit (`support.test.ts`, 3 tests): handle vs anonymous labeling, resolve/dismiss + audit,
  unknown-ticket 404.
- Driven in dev: submit from `/support` signed-out and signed-in → ticket lands in admin
  `/support`; resolve moves it out of the open queue and writes the audit entry.
