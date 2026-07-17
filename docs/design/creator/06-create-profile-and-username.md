# 06 — Create Profile & Choose Username

- **Route:** `plugfolio.com/dashboard/profiles/new` (create) and profile settings for username
- **Role:** Creator (**Admin** only)
- **Priority:** P0
- **Entry points:** after connecting a social (brief 05); the profile switcher's "+ New profile" (up to 5)

## Purpose

Turn a connected social identity into a shoppable **profile**. Assign a working page
instantly (random username), then let the creator claim their real handle **from the
usernames they actually own** on the connected YouTube/Instagram.

## Layout (mobile-first, 360px)

**Step A — create the profile**
```
┌───────────────────────────────┐
│  New profile   (2 of 5 used)  │
│  Build from:                  │
│   ( ) YouTube · @channelname  │
│   ( ) Instagram · @handle     │
│   ( ) Both                    │
│                               │
│         [ Create ]            │
│  A temporary username is set; │
│  you can pick yours next.     │
└───────────────────────────────┘
```

**Step B — choose username**
```
┌───────────────────────────────┐
│  Choose your username         │
│  Pick from your handles:      │
│   ( ) yourig      available   │
│   ( ) yourtube    taken ✕     │  ← already on Plugfolio
│  Current: user-7f3q (random)  │
│                               │
│  plugfolio.com/ yourig        │
│         [ Save ]              │
└───────────────────────────────┘
```

- **Create step:** pick which connected identity the profile is built from (one YouTube
  channel and/or one Instagram account). Show the **"N of 5 used"** cap.
- On create, assign a **random username** so the page is live immediately, and start importing posts.
- **Username step:** offer **only** the handles the creator holds on the connected socials.
  Show availability; show the live `plugfolio.com/<username>` preview.

## Content & data

Available channels/handles from connections; profile count vs the 5-cap; username
availability (global uniqueness); the assigned random username.

## Actions

- **Primary:** Create profile; then Save username.
- **Secondary:** Keep the random username for now (skip); switch which handle.

## States

- **Default:** create form / username picker.
- **Loading:** creating; checking availability; importing posts (can proceed while import runs).
- **Empty:** no connections yet → send to brief 05.
- **Error:** at profile cap (5) → explain, offer to manage existing; save failure.
- **Edge cases (important):**
  - **Chosen handle already taken on Plugfolio** → shown as unavailable; **first verified owner keeps it**; creator stays on random until they pick a free one.
  - Only one platform connected → only that handle is offered.
  - YouTube "username" = the channel **@handle**.
  - Username is treated as **immutable-ish** — changing it later changes the public URL; if allowed, warn about the link change (redirect handling is deferred).

## Components

Radio/Select (identity + handle), Input preview, Badge (available/taken), Button, Skeleton (import), Toast.

## Theme & accessibility

Make the `plugfolio.com/<username>` preview the hero of step B. Availability uses
success/danger tokens + text (not color alone). Announce availability results.

## Out of scope (v1)

No free-form/vanity usernames, no >5 profiles, no custom domains, no storefront theming
beyond what Profile Settings (brief 10) covers.
