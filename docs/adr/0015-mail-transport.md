# ADR-0015 — Mail transport: Resend HTTP API, env-gated, console fallback

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

## Consequences

- Deployment needs two env vars per app; nothing else changes — the
  `AuthMailer` port stays the seam, so swapping providers later is one
  adapter.
- Dev behavior is unchanged (links in the server log).
- Deliverability concerns (domain verification, DKIM) live in the Resend
  dashboard, not in code.

## Status

Accepted — July 2026.
