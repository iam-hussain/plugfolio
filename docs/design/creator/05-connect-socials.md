# 05 — Connect Socials (Google / Meta)

- **Route:** `plugfolio.com/dashboard/connections`
- **Role:** Creator (**Admin** only)
- **Priority:** P0 — the gate to creating any profile
- **Entry points:** right after creating the account; the "Connect to create a profile" prompt; Profile Settings

## Purpose

Let the Admin connect **one Google (YouTube)** and **one Meta (Instagram)** to the account.
This is what unlocks profile creation *and* proves identity (you can only connect accounts
you own — which is what makes `plugfolio.com/<username>` un-squattable). **Not required at
sign-up** — done whenever the creator is ready.

## Layout (mobile-first, 360px)

```
┌───────────────────────────────┐
│  Connect your socials         │
│  Connect at least one to      │
│  create a profile.            │
│                               │
│  ┌───────────────────────────┐│
│  │ ▶ YouTube (Google)        ││
│  │   Not connected  [Connect]││
│  └───────────────────────────┘│
│  ┌───────────────────────────┐│
│  │ ◎ Instagram (Meta)        ││
│  │   Not connected  [Connect]││
│  └───────────────────────────┘│
│                               │
│  Why connect? one line of     │
│  reassurance (identity/import)│
└───────────────────────────────┘
```

- Two connection cards: **Google (YouTube)** and **Meta (Instagram)**. Each shows status
  and a **Connect** (OAuth) action.
- Copy sets expectations: at least one needed; connecting proves ownership and imports posts.
- After connecting, the card flips to **connected** (account name/handle shown) with a
  **Manage** affordance — but note the disconnect rule (below).

## Content & data

Per provider: connection status, the connected account/channel identity, available
channels/handles (a Google account may expose several YouTube channels; Meta may expose
several IG accounts — these feed username choice in brief 06).

## Actions

- **Primary:** **Connect** (OAuth to Google / Meta).
- **Secondary:** Re-authenticate (recovery — always allowed); Disconnect (**gated** — see states).
- **Continue:** once ≥1 connected → **Create a profile** (brief 06).

## States

- **Default / none connected:** two Connect cards, primary path emphasized.
- **One connected:** show connected state + the other still available; "Create a profile" now enabled.
- **Both connected:** both cards connected.
- **Loading:** OAuth round-trip (redirect out and back) — show a clear returning/verifying state.
- **Error:** OAuth denied/cancelled, token error → friendly retry, no dead end.
- **Edge cases (important):**
  - **Disconnect is gated:** if any profile depends on a connection, **Disconnect is blocked** with an explanation ("Delete the profiles using this connection first"). **Re-authenticate** stays available for recovery.
  - Provider returns **multiple channels/accounts** → that choice surfaces during profile creation, not here.
  - Expired token → prompt to re-authenticate.

## Components

Card (per provider), Button, Badge (status), Dialog (disconnect-blocked explanation), Skeleton/redirect state, Toast.

## Theme & accessibility

Provider cards on `--surface-raised`; use the real provider marks for recognizability
(within brand). Connected = success token, not lime. Clear focus states across the OAuth
return. Announce status changes.

## Out of scope (v1)

No TikTok or other platforms, no per-post import controls here (that's the dashboard), no
analytics. Just the two connections and their lifecycle.
