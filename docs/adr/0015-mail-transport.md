# ADR-0015 — Mail transport: Twilio Email API, env-gated, console fallback

## Context

Three flows depend on email links: member verification/reset (ADR-0012),
Manager first-password invites, and admin operator invites/resets
(ADR-0014). All rode a console-logging mailer — fine in dev, useless
deployed. We need a real transport that both deployables (apps/api,
apps/admin) can share without new heavy dependencies.

## Decision

**Twilio's Email API via its plain HTTP endpoint** — `createTwilioMailer`
in `@plugfolio/core/adapters` uses `fetch` against
`comms.twilio.com/v1/Emails`, so no SDK or SMTP dependency enters the tree.
Basic auth rides a **REST API key** (`SK…` + secret) rather than the account
auth token: scoped, revocable, and Twilio's own advice — verified against
the live endpoint, not assumed.

Each composition root wires it **env-gated**: when `TWILIO_API_KEY_SID` +
`TWILIO_API_KEY_SECRET` + `EMAIL_FROM` are set the real transport sends;
otherwise the console mailer keeps logging links (dev default). Send
failures throw loudly — auth links are the account lifeline, silent drops
are worse than errors. `EMAIL_FROM` carries the `"Name <addr>"` form and
the adapter splits it into the `{address, name}` object the API wants. The
send is asynchronous (202 + an operation id); we don't poll it — blocking
registration on that round-trip buys nothing a bounce report can't tell us.

**Superseded July→August 2026: Resend.** The original decision here was
Resend's HTTP API, on the same `AuthMailer` port. Twilio is the account we
actually have, so `createResendMailer` and `RESEND_API_KEY` were removed
rather than left as a second unconfigured path — one transport, one set of
credentials, one thing to keep working. The port is still the seam, so
bringing another provider back is one adapter.

**Rejected: Twilio Verify.** Verify would own verification end to end
(it mints the code, sends the mail, rules on the answer), but it costs a
second port, an `email` on the verify link so a check can name the address,
and — because its email channel is itself SendGrid — the verification email
would live as a Dynamic Template in the Twilio console, out of the repo's
sight and free to drift from `emails.html` §7. The Email API sends our own
template over our own one-time link, so none of that is needed. Verification
stays exactly as ADR-0012 describes it.

## Consequences

- Deployment needs three env vars per app; nothing else changes — the
  `AuthMailer` port stays the seam, so swapping providers later is one
  adapter.
- Dev behavior is unchanged (links in the server log).
- The sending domain must be authorized in Twilio (Console → Senders; the
  API exposes it read-only). Until it is, every send fails 403 — loudly,
  which is the point.
- Deliverability concerns (domain authentication, DKIM) live in the Twilio
  dashboard, not in code.

## Status

Accepted — July 2026; transport changed to Twilio August 2026 (Resend removed).
