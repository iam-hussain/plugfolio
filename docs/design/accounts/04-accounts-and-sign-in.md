# 04 — Accounts & Sign-in (all roles)

*Updated July 2026 for password sign-in — [ADR-0012](../../adr/0012-password-login-with-registration-verification.md). The old magic-link-per-login flow is gone: the email link now appears exactly once, at registration.*

- **Routes:** `plugfolio.com/join` (register), `plugfolio.com/signin` (login), `/verify` (from the email link), `/forgot` + `/reset` (password reset); shopper claim is inline (sheet, no dedicated page)
- **Roles:** Creator, Business (full accounts); Shopper (lightweight, opt-in)
- **Priority:** P1 — but **never** on a shopping path
- **Entry points:** "Sign in / Get started" from marketing or dashboard; **Follow** or **Comment** taps for shoppers; a business "Create account" CTA

## Purpose

One consistent, minimal auth system: **register with email + password, verify the email
once, then every login is a single step** — no email round-trip (in-app browsers lose the
session when users switch to a mail app; login must never depend on one). The design must
make clear this is only for people who *act* (create, hire, follow, comment) — shopping
needs none of it.

## The model in one table

| Moment | What happens | Email involved? |
|---|---|---|
| **Register** | email + password → account created, **verification email sent (link + 6-digit code)** | ✅ once |
| **Verify** | tap the link *or* type the code → **pick a username** → account active → continue to role's next step | (is the email) |
| **Login** | email **or username** + password → in | ❌ never |
| **Forgot password** | email → **reset link** → set new password | ✅ only here |

**One username field, and it lives on Verify** (ADR-0024). Register still never asks —
that screen stays email + password. The member `@handle` is chosen at verification (still
editable later in `/account`) and **is** a login, alongside the email. The *profile*
username is a different thing, comes from connected socials (brief 06), and is never a
login. Don't put a username field on Register, Login, Forgot or Reset.

## The three entries (same pattern, different context)

| Who | Trigger | What they get |
|---|---|---|
| **Shopper** | Taps **Follow** or **Comment** | Inline **register sheet** (email + password) over the page they're on. After registering: "check your email" — the follow/comment completes once verified and signed in. |
| **Creator** | "Get started" / dashboard | Register page. After verifying, they land on **Connect Socials** (brief 05). |
| **Business** | "Create business account" | Register page + business basics (name, what they sell, logo) after verification. |

## Layout (mobile-first, 360px)

```
┌───────────────────────────────┐    ┌───────────────────────────────┐
│         plugfolio             │    │         plugfolio             │
│  Create your account          │    │  Welcome back                 │
│                               │    │                               │
│  Email     [ __________ ]     │    │  Email     [ __________ ]     │
│  Password  [ __________ 👁 ]  │    │  Password  [ __________ 👁 ]  │
│         [ Create account ]    │    │         [   Sign in    ]      │
│                               │    │                               │
│  We'll send one link to       │    │  Forgot password? · Create    │
│  verify your email.           │    │  account                      │
└───────────────────────────────┘    └───────────────────────────────┘
```

- **Two fields, one button** on both pages. Password gets a show/hide toggle (👁) —
  mobile keyboards make blind typing error-prone.
- **Register says what happens next** ("we'll send one link to verify") so the email
  step never surprises.
- **Role context** sets the heading and the follow-on step; the pages themselves are
  role-agnostic.
- **Shopper claim is inline** — a sheet over the page they're on, so Follow/Comment
  doesn't navigate away. The sheet is the register form, nothing more.

## Content & data

Email, password (min 8 chars — show the rule up front, not as a post-submit error);
verification state; on Verify: the six-digit code and the chosen username (3–30, letters,
numbers, dots, dashes — the rule shown under the field, not after submit); for business: name, category, logo (after verification). Session
carries the **role** so the app routes correctly afterward.

## Actions

- **Register:** Create account → "check your email" state → (from email) Verify → role's
  next step. Secondary: **enter the code instead**, resend email, change email, go to sign-in.
- **Login:** Sign in → straight in. Secondary: forgot password, go to register.
- **Verify page:** a form, not an auto-confirm. Arriving on the link, it asks only for the
  username; arriving bare (`/verify`), it asks for email + the six-digit code as well.
  Submitting verifies and claims the handle together, then forwards.
- **Forgot/Reset:** email → "check your email" → (from email) new password + confirm →
  signed in.

## States

- **Register:** default · submitting · **"check your email"** (with resend + change-email)
  · email already registered (offer sign-in / forgot — do NOT leak whether the email
  exists beyond this standard flow) · weak password (inline, live rule) · rate-limited.
- **Login:** default · submitting · wrong identifier/password (one generic message — never
  say which was wrong) · **unverified email** (distinct state: "verify your email first" +
  resend button) · rate-limited.
- **Verify:** default (username; plus email + code when there's no link) · submitting ·
  **handle taken/reserved** (inline — the link is still good, try another) · wrong or
  expired code/link (offer a fresh email) · success (auto-forward).
- **Reset:** link sent · new-password form · expired link · success (signed in).
- **Edge cases:** shopper who abandons the sheet (Follow/Comment simply doesn't persist —
  no nagging); verification link opened on a different device (works — it verifies the
  account, then asks them to sign in there or return); invited **Manager** arrives via an
  invite link with **no password yet** → lands on a set-password screen (same layout as
  reset), then straight to the managed profile.

## Components

Input (email, password with visibility toggle), Button, Sheet (shopper inline claim),
inline validation, Toast, Skeleton/spinner for submitting states.

## Theme & accessibility

Calm, minimal, centered. One primary button per screen. Password toggle is a labeled
button (not an unlabeled icon); errors are announced (aria-live) and never color-only.
Announce the "check your email" transition. Never trap the shopper — the sheet's dismiss
must always return them to browsing. No dark patterns, no "you must sign up to continue."

## Out of scope (v1)

No social **login** (Google/Meta OAuth is for connecting a creator's channels — brief 05);
no magic-link login (the email link exists only for verify / reset / invites); no username
or handle fields anywhere in auth; no 2FA/passkeys yet; no password-strength meter beyond
the minimum rule; no shopper profile beyond `/account` (handle) and `/following`.
