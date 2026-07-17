# 12 — Collabs & Negotiation Thread

- **Routes:** creator side `plugfolio.com/dashboard/collabs`; business side opens from a requirement/outreach (brief 11); the thread is shared
- **Roles:** Creator (**Admin** and **Manager**) and Business — two ends of the same thread
- **Priority:** P1
- **Entry points:** creator's **Collabs** dashboard tab; a business's requirement approaches / outreach

## Purpose

One simple place for a creator and a business to **agree content and price** — the whole
collab side of v1. No DMs, no email chains. **Money changes hands off-platform** (v1 rule),
so the thread ends at *agreed terms*, not payment.

## Layout (mobile-first, 360px)

**Creator — Collabs tab (two lists)**
```
┌───────────────────────────────┐
│ [Profile ▾]     Collabs       │
│  Open requirements  (browse)  │
│   • BrandA “Summer reel” $$   │  [ Approach ]
│   • BrandB “Unboxing”    $    │  [ Approach ]
│                               │
│  Your requests (incoming)     │
│   • BrandC reached out  •new  │ → thread
│   • BrandA (you approached)   │ → thread
└───────────────────────────────┘
```

**Shared thread**
```
┌───────────────────────────────┐
│ ← BrandC · “Summer reel”      │
│  Brief: reel · $X · by Aug 3  │  ← the terms, always visible at top
│  ─────────────────────────    │
│  BrandC: hi! would you…       │
│  You:   yes, I can do…        │
│  ─────────────────────────    │
│  [ message …            ] [→] │
│  [ Propose terms ] [ Agree ]  │
└───────────────────────────────┘
```

- **Creator Collabs tab:** two lists — **open requirements** to browse & **Approach**, and
  **incoming/your requests** (business reached out, or you approached) → open the thread.
- **Thread:** the **terms** (content type, price, deadline) pinned at the top, a simple
  message exchange, and lightweight **Propose terms / Agree** actions. When both **Agree**,
  the thread shows an agreed state; delivery happens off-platform.

## Content & data

Thread: the two parties (business + creator profile), the linked requirement/brief, messages
(author, text, time), proposed terms (content, price, deadline), agreement status per side.

## Actions

- **Primary:** send a message; **Propose terms**; **Agree**.
- **Secondary (creator):** Approach an open requirement (starts a thread); decline/archive.
- **Secondary (business):** open threads from a requirement's approaches or an outreach.

## States

- **Default:** lists / active thread.
- **Loading:** message send; list skeleton.
- **Empty:** creator with no collabs → "No requirements to approach yet, and no requests — your public page is how businesses find you." Business with no threads → see brief 11.
- **Error:** send failure (retry, keep draft); approach when a requirement just closed.
- **Edge cases:** both propose different terms (latest proposal is the live one; both must Agree to the same); a **Manager** acting in the thread (allowed — Managers can post/communicate); requirement closed mid-thread (thread stays usable); one side goes silent (no payment state to strand, since money is off-platform).

## Components

Tabs/List (two lists), thread/message view, Input/Textarea, Button (Approach / Propose / Agree), Badge (new / agreed / closed), Toast, Skeleton, Dialog (propose terms).

## Theme & accessibility

Keep the **agreed terms visible** at all times — that's the point of the thread. "Agree" is
the one emphasized action (candidate for the lime moment). Distinguish who-said-what clearly
(avatars/alignment) and don't rely on color alone for agreement status. Full keyboard path,
message list is screen-reader navigable.

## Out of scope (v1)

No on-platform payment/escrow, no contracts/e-sign, no deliverable upload/approval, no
ratings of the collab, no campaign dashboards — deferred. The thread's job ends at "agreed."
