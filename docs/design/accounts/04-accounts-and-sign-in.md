# 04 — Accounts & Sign-in (all roles)

- **Routes:** `plugfolio.com/join` (create), `plugfolio.com/signin` (return); shopper claim is inline (no dedicated page needed)
- **Roles:** Creator, Business (full accounts); Shopper (lightweight, opt-in)
- **Priority:** P1 — but **never** on a shopping path
- **Entry points:** "Sign in / Get started" from marketing or dashboard; **Follow** or **Comment** taps for shoppers; a business "Create account" CTA

## Purpose

One consistent, minimal sign-in system. **Everyone signs in by email.** The design must make
clear that this is only for people who *act* (create, hire, follow, comment) — shopping needs none of it.

## The three entries (same pattern, different context)

| Who | Trigger | What they get |
|---|---|---|
| **Shopper** | Taps **Follow** or **Comment** | An inline **email magic-link** claim — the lightest possible. No password, no profile setup. |
| **Creator** | "Get started" / dashboard | Email account. After creating it, they land on **Connect Socials** (brief 05). No username here. |
| **Business** | "Create business account" | Email account + business basics (name, what they sell, logo). |

## Layout (mobile-first, 360px)

```
┌───────────────────────────────┐
│         plugfolio             │
│  Create your account          │
│                               │
│  Email  [ __________ ]        │
│         [  Continue  ]        │
│                               │
│  ─ or ─  (role-specific)      │
│  We’ll email you a link       │
└───────────────────────────────┘
```

- **Email-first**, single field, one **Continue**. Prefer **magic-link / OTP** to avoid password UX (esp. for shoppers).
- **Role context** sets the heading and the follow-on step (creator → connect socials; business → business basics; shopper → return to what they were doing).
- **Shopper claim is inline** — ideally a small sheet over the page they're on, so Follow/Comment feels instant and they never lose their place.

## Content & data

Email; verification state; for business: name, category, logo. Session carries the **role**
so the app routes correctly afterward. (Creator username is **not** set here — it's per-profile, brief 06.)

## Actions

- **Primary:** Continue → send magic link / OTP.
- **Secondary:** switch between create / sign-in; resend link; for shopper, dismiss and keep shopping.

## States

- **Default:** email entry.
- **Loading:** Continue → sending.
- **Sent:** "Check your email" with resend + change-email.
- **Empty:** n/a.
- **Error:** invalid email (inline), link expired/used (clear re-request), rate-limited (friendly).
- **Edge cases:** shopper who abandons the claim (Follow/Comment simply doesn't persist — no nagging); magic-link opened on a different device (handle gracefully); business logo upload optional and skippable.

## Components

Input, Button, Sheet (shopper inline claim), Toast, form validation, Skeleton/spinner for the send state.

## Theme & accessibility

Calm, minimal, centered. One primary button. Announce the "check your email" transition.
Never trap the shopper — dismiss must always return them to browsing. No dark patterns, no "you must sign up to continue."

## Out of scope (v1)

No social login (Google/Meta OAuth here is for **connecting a creator's channels**, not
for auth — see brief 05), no passwords if magic-link suffices, no username creation on this
screen, no shopper profile/settings page beyond an optional "creators you follow" list.
