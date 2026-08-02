# ADR-0024 — The username is picked at verification, and it is a login

**Status:** Accepted (2026-08-02) — amends [ADR-0009](./0009-member-handles-and-comment-identity.md)
and [ADR-0012](./0012-password-login-with-registration-verification.md)

## Context

ADR-0009 auto-generated the member handle (`user-3f9a1c22`) so sign-up stayed one step, and
ADR-0012 (point 4) refused it as a credential: the handle is public on every comment, so
accepting it at login hands attackers a ready-made username list for credential stuffing.

Two things pushed back on that. First, a name nobody chose is a name nobody keeps — the
handle is the account's face on every comment, and `user-3f9a1c22` reads as spam. There is
already a free moment to ask for one: the verification click, where the person is engaged,
has proved the inbox, and has nothing else to do. Second, in-app browsers (§2.5) lose the tab
when you leave for the mail app, so a link-only verification strands a real share of
registrations — and people who signed up on their phone remember a handle far better than
which of their addresses they used.

The stuffing objection is real but is a **rate-limiting** problem, not an identifier problem;
the failure mode it describes (many passwords against known usernames) is identical against
known email addresses, which are just as public in any breach corpus.

## Decision

1. **Registration is unchanged** — email + password, no username asked for. The `User` row is
   still created with a generated handle, but it is now a **placeholder**, not the name.
2. **Verification is where the account gets its name.** `/verify` submits proof + username
   together; there is no verified account without a chosen handle. The handle is claimed
   **before** the token is spent, so "that handle is taken" costs a retry, not the link.
3. **The verification email carries two proofs of the same inbox**: the link (24h) and a
   **six-digit code** (15 min) typed into `/verify`. Both are rows on the same
   `VerificationToken` identifier; the code is stored as `sha256("code:<email>:<code>")`, so
   six digits are worthless without the address they were sent to.
4. **Login accepts the email OR the member handle**, same password. The boundary field is
   `identifier`; `verifyCredentials` resolves it with one `OR` lookup, and the failure copy
   stays one generic "those details don't match an account".
5. **Admin sign-in stays email-only** (`adminCredentialsInput`) — operators have no public
   handle, and the admin app already rate-limits per address (ADR-0014).

## Consequences

- ADR-0009's "never a login" and ADR-0012's point 4 are reversed; ADR-0009's
  auto-generation survives only as the pre-verification placeholder.
- `AuthAccount` now carries `email` (a lookup by handle still has to know where to mail), and
  `AuthTokenRepository` gains `peek` — read without spending, so the handle check runs first.
- **The 15-minute window is the only brute-force defence on the code today** (1M
  possibilities). Before real traffic, add per-email attempt throttling at the API edge — the
  admin app's `isRateLimited` is the pattern to lift. Marked `ponytail:` in
  `services/account-auth.ts`.
- The invited-Manager path (a reset link that verifies, ADR-0012 point 5) does **not** ask for
  a handle — they keep the placeholder until they change it in settings. Worth folding in when
  invite mails get their own screen.

## Revisit if

- Handle-stuffing shows up in the logs — the answer is a rate limit, not withdrawing the
  identifier.
- Profile usernames (ADR-0004) ever want to share the member-handle namespace; they are still
  separate today.
