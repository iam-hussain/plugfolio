# ADR 0001 — Technology Stack

**Status:** Accepted

## Context

Plugfolio is a mobile-first, shoppable creator platform. The defining constraints
(from `plugfolio-lean-journey.md`):

- Public creator pages must be **fast and SEO-friendly**, and load well **inside
  Instagram/TikTok in-app browsers** — that's where most shoppers arrive.
- **Shopping requires no account**; only creators, businesses, and shoppers who
  follow/comment authenticate.
- **v1 handles no money** — creators use their own affiliate links; collab payment
  is off-platform.
- Small team, greenfield repo — favor one language and a monolith that can be
  split later, not premature microservices.

## Decision

Adopt the following stack as the committed baseline:

| Layer | Choice |
|---|---|
| Language | TypeScript (strict) end-to-end |
| Framework | Next.js (App Router, React Server Components) |
| Styling | Tailwind CSS with semantic design tokens |
| UI primitives | Radix (headless) + our own styled component layer |
| Client data | RSC-first; TanStack Query for client-side data |
| Backend | Next.js Route Handlers / Server Actions over a layered service/repository domain (extractable later) |
| Database | PostgreSQL + Prisma |
| Auth | Auth.js (NextAuth), gated per role; shoppers anonymous by default |
| Validation | Zod at every boundary |
| Testing | Vitest (unit) + Playwright (journey e2e) |
| Hosting | Vercel |

## Consequences

- **Positive:** one language front-to-back; server components give fast, indexable
  public pages that behave in in-app browsers; a single repo keeps v1 simple; the
  service/repository layering (see CLAUDE.md §6) means the backend can be extracted
  from Next.js without rewriting business rules; Zod gives one source for runtime
  validation *and* types.
- **Trade-offs:** couples us to the Next.js/Vercel ecosystem for v1; RSC + Server
  Actions are still maturing patterns; Prisma adds a build step. All acceptable at
  our scale.
- **Revisit if:** we outgrow a single deployable (extract the `server/` domain into
  a standalone service), or the shopper surface needs a native app (the API layer
  already sits behind services, so this is additive).

Superseding this decision requires a new ADR marking this one *superseded*, plus an
update to the stack table in `CLAUDE.md`.
