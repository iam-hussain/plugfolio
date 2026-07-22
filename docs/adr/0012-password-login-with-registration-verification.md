# ADR-0012 — Password login; the email link is for verification only

**Status:** Accepted (2026-07-22) — amends [ADR-0007](./0007-authjs-identity-tables.md)

## Context

ADR-0007 made sign-in a per-login email magic link: passwordless meant nothing to store or
reset, and the link doubled as email verification. The lived cost is an email round-trip on
**every** login — worst exactly where our users are, inside Instagram/TikTok in-app
browsers, where switching to a mail app and back frequently loses the session. Product
decision: verification belongs to **registration**, not to every login.

## Decision

1. **Registration = email + password.** On submit: create the `User` (member handle
   auto-generated per ADR-0009 — registration still never asks for a username), store a
   **scrypt** hash (`node:crypto`, per-user salt — no new dependency), send **one
   verification link** (the existing Auth.js `VerificationToken` plumbing). The account
   can't sign in until the link is clicked.
2. **Login = email + password.** Auth.js **Credentials** provider; sessions **stay
   database sessions** (the adapter's session table — the credentials flow creates them
   explicitly). An unverified email is refused with a **resend-verification** offer, not a
   generic failure.
3. **Forgot password = email reset link** — the same token plumbing pointed at a
   set-new-password page. This ships **with** password login, not after it: passwords
   without reset are permanent lockouts.
4. **The username is never a credential.** Login is by email only. The member handle is
   public (on every comment) — accepting it as a login identifier would hand attackers a
   public username list for credential stuffing. ADR-0009 stands unchanged.
5. **Passwordless users exist and are fine.** A Manager invited by email (ADR-0004) has a
   `User` row with **no password**; the invite email carries a verification-style link
   that lands on set-password. `passwordHash` is therefore nullable.
6. **Magic-link login is dropped** as an interactive method. The email-link machinery
   remains — repurposed for verification, invites, and resets.

## Consequences

- We now hold password hashes: scrypt with per-user salt, comparison in constant time;
  hashing lives in the service layer, never in routes.
- `User.passwordHash String?` is the only schema change; `VerificationToken` is reused
  for verify / invite / reset (token intent encoded, single-use, expiring).
- Login becomes one step with no email dependency; first-time friction (one verification
  click) is unchanged from the magic-link world — it was always one email round-trip.
- Email transport is still dev-logged (ADR-0007's note stands); verify/reset/invite mails
  plug into the same sender at deployment time.
- ADR-0007's identity tables, database sessions, and "the ADR-0004 account is the `User`
  row" all stand — only the sign-in method is amended.

## Revisit if

- Social *login* (not channel-connect) is ever wanted — Google/Meta OAuth rows already
  exist for creators; promoting them to a login method is a small ADR.
- Passkeys mature enough for in-app browsers — they'd slot in as a second credential.
