# ADR-0007 — Auth.js owns the identity tables; the ADR-0004 "account" is the `User` row

## Context

ADR-0004 defines the creator **account**: email login, connects one Google + one Meta, holds up to 5 profiles. We committed to Auth.js (ADR-0001) for sign-in. Auth.js's Prisma adapter expects its own table shapes — `User`, `Account` (provider links), `Session`, `VerificationToken` — and our schema already had a domain model named `Account` (the creator account), which collided.

## Decision

Adopt the Auth.js table shapes as the identity model rather than adapting around them:

- Our former `Account` model is **renamed to `User`** — the login identity for every account holder (creator, shopper, business — all email sign-in per ADR-0004). `Profile.accountId` becomes `Profile.userId`.
- The Auth.js **`Account`** table (OAuth provider links) is exactly ADR-0004's **"connected socials"**: a Google/Meta `Account` row *is* the connection a profile is built on. The at-most-one-of-each rule is enforced in the service layer when connects land.
- Sessions are **database sessions**; sign-in is an **email magic link** (the username is never a login, per ADR-0004).
- The adapter is created inside `@plugfolio/db` (`createAuthAdapter`) so Prisma stays confined to the db package (§6.2); the web app wires it into NextAuth at its composition root.
- The migration is a hand-written `RENAME` (not a generated drop/create) so existing rows survive.

## Consequences

- No parallel identity model: one `User` row per person, whatever their role mix; role-specific data hangs off it (profiles for creators; shopper/business shapes come with their features).
- Future Google/Meta connects need no schema work — they're adapter-standard `Account` rows.
- The domain vocabulary "account" (ADR-0004) maps to `User` in code; docs keep the product word, code keeps the Auth.js word.
- Email transport is not yet wired; dev logs the magic link. A mail provider plugs into `sendVerificationRequest` at deployment time.

## Status

Accepted (2026-07-18). Amends ADR-0004's storage detail; the product-level identity model in ADR-0004 is unchanged.
