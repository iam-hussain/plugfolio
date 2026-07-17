# ADR 0004 — Creator Account, Profiles & Social-Connected Identity

**Status:** Accepted (supersedes [ADR-0003](./0003-auth-methods-per-role.md))

## Context

The creator side needs to support real creators and small agencies who run **more than
one brand**, while keeping usernames trustworthy (no squatting) and onboarding simple.
ADR-0003's "creators log in by username" breaks the moment one login owns several
usernames. We also want the public handle to *mean* something — that the person behind
`plugfolio.com/<username>` genuinely controls that social identity.

## Decision

### Entities

- **Account** — the login entity. Authenticates **by email** (same as shoppers and
  businesses; username is never a login). Created on email alone — **social connections
  are added after account creation, not required at sign-up**. Connects to **one Google
  (YouTube)** and **one Meta (Instagram)**. Holds **up to 5 profiles**.
- **Profile** — one shoppable public page, addressable at `plugfolio.com/<username>`.
  Built from the social identities the account's connections expose. One account → many
  profiles (max 5).
- **Connected socials** — per profile, **at most one YouTube channel + one Instagram
  account**, sourced from the account-level Google/Meta connections.

### Identity / username

- A creator **must connect at least one** of Google/Meta before any profile can exist.
  Connection happens **after account creation** (any time the creator is ready), and is
  the gate to *profile* creation — not to signing up. It also proves identity (you can
  only OAuth an account you control, so `plugfolio.com/<handle>` is self-verifying — no
  squatting).
- On profile creation, a **random username** is assigned so the page is live immediately.
- The creator may later set the username **only from the handles they actually hold** on
  the connected YouTube/Instagram (YouTube = channel `@handle`). No free-form usernames
  in v1.
- **Collisions:** usernames are globally unique on Plugfolio (they're URLs). First
  verified owner keeps a handle; a later claimant stays on their random username until
  they pick a free one.

### Roles (per-profile, exactly two in v1)

Membership is **scoped to a profile**, not the whole account. Each profile has **exactly
one Admin** (the account owner) and **up to 3 Managers** invited to help run that profile.

| Capability | Admin (1 / profile) | Manager (≤3 / profile) |
|---|---|---|
| Connect Google/Meta; create/delete profiles | ✅ | ❌ |
| Edit profile name, username, settings | ✅ | ❌ |
| Post content, tag products | ✅ | ✅ |
| Change profile picture | ✅ | ✅ |

### Connection lifecycle

- Every profile always keeps **≥1** connected social.
- An Admin may **re-authenticate** a connection at any time (token refresh / account
  recovery).
- An Admin **cannot fully disconnect** a Google/Meta while any profile depends on it —
  the profile must be deleted first. (Recovery-friendly: re-auth is always allowed;
  only a *removing* disconnect is gated.)

## Consequences

- **Positive:** usernames are trustworthy by construction; agencies/multi-brand creators
  are first-class (up to 5 profiles per login); onboarding is "connect → profile appears
  → pick your handle"; the two-role model covers "someone posts for me but can't rename
  my brand" without a permissions matrix.
- **Trade-offs / things to build:** OAuth to Google **and** Meta up front (heavier than
  paste-a-URL); reading channel/handle lists from each provider; a username-reservation +
  uniqueness service; profile-switcher UX; role-aware authorization on every write; the
  "can't disconnect while depended-on" guard. Losing access to a social without another
  connected means the profile can't be recovered except by deletion — accepted for v1.
- **Data model sketch:** `Account (email, googleConn?, metaConn?)` → has-many `Profile
  (username, pictureUrl, ytChannel?, igAccount?)`; `ProfileMembership (profileId, userId,
  role)` for Admin/Manager, with constraints **exactly one Admin per profile** and **≤3
  Managers per profile**; usernames unique, immutable-ish (change = deliberate, redirect
  handling deferred). Attribution/earnings still key off the profile.

## Revisit if

- Agencies need **>5 profiles**, **>3 managers per profile**, or **additional role types**
  beyond Admin/Manager (all deferred today).
- We add platforms beyond YouTube/Instagram (add providers; identity rules unchanged).
- Vanity usernames not tied to a social become desirable (needs moderation + anti-squat).
