# Business collabs — accounts, the requirements board, and threads

**Journey served:** the business journey in [`plugfolio-lean-journey.md`](../../plugfolio-lean-journey.md) — create a business account, then meet creators through **two doors**: post a requirement creators approach (door one), or reach out to a creator directly (door two). Both land in one thread where content + price are agreed. **v1 handles no money** (§2.3): "agreed" is a handshake; payment settles off-platform.

## Data model

Migration `20260720120000_business_collabs`:

- `Business` — `userId` unique (one business per user in v1), name, "what you sell", optional logo.
- `Requirement` — the posted brief: title, brief, free-text `budget` (display-only — no money rails), optional deadline. The open board = all requirements, newest first.
- `Collab` — one thread per business × profile (× requirement): `requirementId` set for door one, null for door two; `businessAgreedAt` / `creatorAgreedAt` — **agreed only when both are set**. `SetNull` on requirement delete so threads outlive the brief.
- `CollabMessage` — the bargain, in order.

## API surface

`POST /api/businesses` · `POST /api/requirements` · `POST /api/collabs/approach` (creator door) · `POST /api/collabs/request` (business door) · `POST /api/collabs/:id/messages` · `POST /api/collabs/:id/agree`. All session-gated (401), actor always from the session. Reads are RSC-direct (no endpoints).

**Authorization** is resolved per thread in the service (`resolveSide`): business side = owns the thread's business; creator side = owns the thread's profile. Non-participants get **404, not 403** — a thread's existence is not revealed. Approaching with someone else's profile or posting without a business → 403.

**Idempotency:** a double-fired approach/request lands its message in the existing matching thread instead of opening a duplicate (`findMatch` — check-then-create; the rare create race yields a harmless duplicate thread, acceptable in v1). Re-agreeing keeps the first timestamp (`updateMany` guarded on null).

## Surfaces

All three run on the themed UI kit per briefs 11–12 (business chrome = brand top bar + sign-out; same tokens, a touch more utilitarian).

- `/collabs` (business): create-business form on first visit; then the business identity header, thread cards (Agreed/Negotiating badge), own requirement cards (budget badge + deadline), the post form (now sends the optional **deadline** the schema always accepted), and a "Find creators" pointer to `/explore`.
- `/collabs/:id` (both roles): the thread — terms card pinned on top with the agreed-state badge, message bubbles (mine right/primary, theirs left/muted, author + time headers), send, and "Accept terms" as the view's one accent moment; the other side's acceptance state shown honestly.
- `/dashboard/collabs` (creator): the Collabs tab inside the dashboard shell — your thread cards + the open board with per-requirement Approach forms (profile switcher applies).

## Edge cases

- A creator with no profile sees the board read-only with a prompt to create one.
- Requirement deleted mid-thread → thread survives as "Direct collab".
- Empty messages rejected at both boundary and UI; all text fields length-capped by the shared Zod schemas.

## Verification

- Unit (`business-collab.test.ts`, 9 tests): one-business conflict, no-business 403, both doors, duplicate approach collapsing, outsider invisibility, side resolution, two-sided agreement with first-timestamp retention.
- e2e: `/collabs` redirects to sign-in; requirement/business APIs 401 anonymous.
- Full two-user loop (business posts → creator approaches → bargain → both accept) driven with curl against a migrated + seeded Postgres.
