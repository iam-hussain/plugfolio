# 10 — Profile Settings & Managers

- **Route:** `plugfolio.com/dashboard/settings` (per profile)
- **Role:** Creator — **Admin** (full); **Manager** (profile picture only)
- **Priority:** P1
- **Entry points:** dashboard; profile switcher; the "choose username" flow (brief 06)

## Purpose

Where an Admin manages a single profile: its public identity (name, username, picture),
its social connections, and the **people who help run it** (up to 3 Managers). Design must
make the **Admin vs Manager** boundary obvious.

## Layout (mobile-first, 360px)

```
┌───────────────────────────────┐
│ [Profile ▾]     Settings      │
│  Public profile               │
│   [avatar] Change picture     │  ← Manager CAN do this
│   Name      [ __________ ]    │  ← Admin only
│   Username  yourig  (edit)    │  ← Admin only; warns about URL change
│                               │
│  Connections                  │  ← Admin only
│   YouTube @ch     [Manage]    │
│   Instagram @h    [Manage]    │
│                               │
│  Managers (2 of 3)            │  ← Admin only
│   • alex@…    Manager   [x]   │
│   • sam@…     Manager   [x]   │
│   [ + Invite manager ]        │
│                               │
│  [ Delete profile ]           │  ← Admin only, destructive
└───────────────────────────────┘
```

- **Public profile:** avatar (**Manager can change the picture**), name and username
  (**Admin only**). Username edit warns it changes the public URL.
- **Connections:** the profile's YouTube/Instagram; disconnect is gated (brief 05).
- **Managers:** list current Managers with **"N of 3"**, invite by email, remove. **Exactly
  one Admin** (the owner) — not editable to multiple.
- **Delete profile:** destructive, Admin only, with confirmation (frees a profile slot;
  required before disconnecting a depended-on social).

## Content & data

Profile: avatar, name, username. Connections + status. Membership list: one Admin + up to 3
Managers (email, role, status: invited/active).

## Actions

- **Admin:** edit name/username, manage connections, invite/remove Managers, change picture, delete profile.
- **Manager:** change **profile picture** only — every other control is visibly disabled/hidden for them.

## States

- **Default (Admin):** all sections editable.
- **Default (Manager):** only the picture control is available; the rest is read-only/hidden with a subtle "Admin only" hint.
- **Loading:** section skeletons; invite sending.
- **Empty:** no Managers yet → "Invite up to 3 people to help post."
- **Error:** invite to an already-added person; at the 3-Manager cap (disable invite, explain); username taken (brief 06 rules); delete confirmation required.
- **Edge cases:** removing a Manager (immediate access loss); username change link-break warning; disconnect blocked until profile deleted.

## Components

Avatar upload, Input, Button, Badge (role), List (managers), Dialog (invite / confirm delete / disconnect-blocked), Toast, permission-aware disabled states.

## Theme & accessibility

Clearly separate **public identity** from **access control**. Destructive actions use danger
token + confirmation. Disabled controls for Managers must still be understandable (tooltip/text
"Admin only"), not just greyed silently. Full keyboard path.

## Out of scope (v1)

No >3 Managers, no additional role types, no per-profile granular permissions, no transfer-
ownership flow, no billing — deferred.
