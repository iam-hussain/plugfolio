# ADR-0015 — Mail transport: Twilio Email or Resend HTTP API, env-gated, console fallback

## Context

Three flows depend on email links: member verification/reset (ADR-0012),
Manager first-password invites, and admin operator invites/resets
(ADR-0014). All rode a console-logging mailer — fine in dev, useless
deployed. We need a real transport that both deployables (apps/api,
apps/admin) can share without new heavy dependencies.

## Decision

**Resend via its plain HTTP API** — `createResendMailer` in
`@plugfolio/core/adapters` uses `fetch` against `api.resend.com/emails`,
so no SDK or SMTP dependency enters the tree. Each composition root wires
it **env-gated**: when `RESEND_API_KEY` + `EMAIL_FROM` are set the real
transport sends; otherwise the console mailer keeps logging links (dev
default). Send failures throw loudly — auth links are the account
lifeline, silent drops are worse than errors.

**Amended August 2026 — Twilio Email alongside Resend.** Same shape:
`createTwilioMailer` posts to `comms.twilio.com/v1/Emails` with plain
`fetch`, no SDK, Basic auth on a REST API key (`SK…` + secret, not the
account auth token — scoped and revocable, per Twilio). Each
composition root now picks in order — Twilio → Resend → console — all gated
on `EMAIL_FROM` being set. The `AuthMailer` port is unchanged, so
verification, reset and manager-invite mail all switch with two env vars.
`EMAIL_FROM` keeps the `"Name <addr>"` form; the adapter splits it into the
`{address, name}` object that API wants. The send is asynchronous (202 +
an operation id); we don't poll it — blocking registration on that
round-trip buys nothing a bounce report can't tell us.

**Rejected: Twilio Verify.** Verify would own verification end to end
(it mints the code, sends the mail, rules on the answer), but it costs a
second port, an `email` on the verify link so a check can name the address,
and — because its email channel is itself SendGrid — the verification email
would live as a Dynamic Template in the Twilio console, out of the repo's
sight and free to drift from `emails.html` §1. The Email API sends our own
template over our own one-time link, so none of that is needed. Verification
stays exactly as ADR-0012 describes it.

## Consequences

- Deployment needs three env vars per app; nothing else changes — the
  `AuthMailer` port stays the seam, so swapping providers later is one
  adapter.
- Dev behavior is unchanged (links in the server log).
- Deliverability concerns (domain verification, DKIM) live in the provider's
  dashboard, not in code.

## Status

Accepted — July 2026; amended August 2026 (Twilio Email transport).
