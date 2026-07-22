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
3. **Comment identity: a smart default plus a picker.** `Comment.authorUserId` is always
   the real person; a nullable `Comment.asProfileId` records which identity the comment
   speaks as. The comment box carries an **identity picker**: the author's `@handle` plus
   every profile they're an Admin or Manager of — usable on **any** page, including other
   creators'. The **default** selection is the page's own profile when the author is a
   member of it, the personal handle everywhere else — brand-speak on someone else's page
   is always a deliberate pick, never a sticky "acting as" mode. The service **validates
   membership** of `asProfileId` on every write. Render: `asProfileId` present → profile
   name + "Creator" badge; absent → `@member-handle`. Users with no profiles never see a
   picker.

## Consequences

- Attribution is fixed with one column on `User` and one on `Comment`.
- Brand-to-brand commenting opens a self-promo spam surface. v1 ships only the
  personal-handle default as the brake — no gating rules; rate limits or "only where
  tagged / in a collab" restrictions are the lever if abuse shows up (deferred, see the
  lean journey).
- A Manager of profiles across several owners gets a long picker list — the picker UI must
  scale past 2–3 entries gracefully.
- Existing `User` rows need a backfill migration generating handles.
- Handle changes should be deliberate (uniqueness check + a reserved-words list; old
  handles aren't redirected — nothing links to them).
- Two handle concepts exist internally (member handle vs. profile username); the docs keep
  them straight by never calling the member handle a "username" in product copy.

## Revisit if

- Member handles get public pages (`/u/<handle>`) — that reopens squatting and the
  namespace-merge question.
- Brand comment spam appears — add gating (comment-as-brand only where tagged or in an
  active collab) or per-profile rate limits; the model already supports either.
