# ADR 0003 — Authentication Methods Per Role

**Status:** Superseded by [ADR-0004](./0004-creator-account-profiles-identity.md)

> **Superseded.** This ADR had creators log in **by username**. That no longer holds:
> a creator account can run multiple profiles (each with its own username), so username
> can't be the login. ADR-0004 replaces this — **all** account holders log in by email,
> and the username becomes a *per-profile* public handle derived from a connected social.
> The shopper/business email decisions below still stand (restated in ADR-0004).

## Context

Plugfolio has three account-holding roles (plus anonymous shoppers). Their sign-in
needs differ:

- **Creators** have a **public URL** — `plugfolio.com/username`. Their username is a
  first-class, public identity they pick and promote.
- **Shoppers** who follow/comment and **businesses** have no public vanity URL; they
  just need a simple, recoverable credential.
- **Anonymous shoppers** never authenticate at all (see ADR-0002).

## Decision

Authenticate **by role**, not with one uniform method:

| Role | Sign-in identifier | Notes |
|---|---|---|
| **Creator** | **Username** | Registered at sign-up. The username **is** the public handle/URL — one identity for login and `plugfolio.com/<username>`. |
| **Shopper** (opt-in) | **Email** | Lightweight account, created only to follow or comment (ADR-0002). |
| **Business** | **Email** | Created to post requirements / reach out to creators. |
| **Anonymous shopper** | none | Signed device token only (ADR-0002). |

Implementation notes:
- **Username rules** (creators): unique (case-insensitive), URL-safe, reserved-word
  blocklist (e.g. `explore`, `api`, `login`, `admin`), immutable-by-default (changing
  it changes the public URL — treat as a deliberate, rate-limited action with redirect
  handling later). Validated with a shared Zod schema used by both sign-up and the
  public-route resolver.
- **Email rules** (shoppers/businesses): standard email verification; shopper accounts
  use the magic-link flow from ADR-0002.
- One Auth.js configuration with role-aware providers; the session carries the role so
  authorization checks (`isCreator`, `isBusiness`) are explicit.

## Consequences

- **Positive:** the creator's username does double duty (credential + public URL), which
  matches how creators think about their identity and keeps sign-up to one claimed name;
  email keeps shopper/business onboarding frictionless and recoverable.
- **Trade-offs:** username auth needs its own reservation, uniqueness, and
  change-with-redirect handling; two identifier types mean role-aware sign-in UX (the
  form asks creators for a username, others for an email).
- **Revisit if:** creators later need email-based recovery/2FA (additive — attach an
  email to the creator account for recovery without changing the username login), or a
  role needs SSO/social login (add a provider under the same Auth.js config).
