# ADR-0009 — Member handles (`@handle`) for every account & comment identity

**Status:** Accepted (2026-07-21) — amends [ADR-0004](./0004-creator-account-profiles-identity.md) and [ADR-0007](./0007-authjs-identity-tables.md)

## Context

Comments render `User.name ?? "Shopper"` — neither unique nor stable, so every anonymous
shopper reads as the same person. All account types (shopper, creator, business) need a
public identity for social actions. Separately, when a creator comments, it's ambiguous
*which* identity speaks — their person, or one of their up-to-5 profiles.

Two constraints stand: sign-in is an email magic link (ADR-0007; a username-login adds an
enumeration surface and nothing else), and profile usernames are URLs kept trustworthy by
social verification (ADR-0004) — a scheme too heavy to impose on shoppers.

## Decision

1. **`User.username` — the member handle.** Globally unique, lowercase slug,
   **auto-generated at first sign-in** (same move as profile random usernames, so sign-up
   stays one step), changeable in settings. It is public identity only: **never a login,
   and the email is never rendered.**
2. **Separate namespace from profile usernames.** Member handles get **no public URL in
   v1** — always rendered as `@handle` in comment/follow contexts. No page behind a handle
   means no squatting value, so free-form handles need no verification. Profile usernames
   remain the only URL namespace, social-verified per ADR-0004.
3. **Comment identity is a door rule, not a picker.** `Comment.authorUserId` is always the
   real person; a nullable `Comment.asProfileId` is set **automatically by the service**
   when the author is the Admin or a Manager of the profile the page belongs to. Render:
   `asProfileId` present → profile name + "Creator" badge; absent → `@member-handle`.
   No identity switcher in v1 — on your own page you speak as the profile, everywhere
   else as yourself.

## Consequences

- Attribution is fixed with one column on `User` and one on `Comment`; an eventual picker
  is just making `asProfileId` user-selectable — no model change.
- Existing `User` rows need a backfill migration generating handles.
- Handle changes should be deliberate (uniqueness check + a reserved-words list; old
  handles aren't redirected — nothing links to them).
- Two handle concepts exist internally (member handle vs. profile username); the docs keep
  them straight by never calling the member handle a "username" in product copy.

## Revisit if

- Member handles get public pages (`/u/<handle>`) — that reopens squatting and the
  namespace-merge question.
- Brand-to-brand commenting (a profile commenting on another creator's page) is demanded —
  that's the identity picker.
