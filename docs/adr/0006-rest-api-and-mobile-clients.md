# ADR 0006 — API Style: REST (Zod/OpenAPI), Mobile-Ready

**Status:** Accepted

**Amends:** [ADR-0001 (tech stack)](./0001-tech-stack.md) — ADR-0001 named "Next.js
Route Handlers / Server Actions" as the transport but never chose REST vs GraphQL. This
records that choice and how a future native app consumes the API.

## Context

Plugfolio's public surface is server-rendered (RSC, ADR-0001): those pages fetch on the
server by calling `@plugfolio/core` services **directly**, with no HTTP hop. The HTTP API
therefore exists for two consumers:

1. **Client islands** in the web app (the buy/tap action, forms, live dashboard lists).
2. A **native mobile app** that is planned but not in v1 — it will ship separately and must
   consume a stable, versioned contract.

We need to decide the API style before feature routes proliferate, because it's expensive to
change once many endpoints exist.

## Decision

**Use REST** — Next.js Route Handlers under `apps/web/src/app/api/*` — with **Zod as the
single source of the contract**, and generate an **OpenAPI spec + typed clients** from those
Zod schemas for non-web consumers.

- The Zod schema that validates a request at the boundary (`@plugfolio/core/schemas`) is the
  same type the client imports. Web and native can't drift from the server contract.
- The public RSC pages keep calling services directly; **REST is not used for server
  rendering**, only for client/native interactivity.
- Route handlers stay thin (§6.3): verify identity → validate with Zod → call one service →
  shape response. Errors map to HTTP codes in one place (§6.5).

**Mobile client:** a **TypeScript React Native (Expo)** app is the expected shape — it reuses
the Zod contracts and `@plugfolio/tokens` straight from `packages/`, and lands as
`apps/mobile` when built. If a non-TS stack (Flutter/native) is chosen instead, it consumes
the generated OpenAPI client rather than shared TS types. Either way the wire contract is the
same REST + OpenAPI surface.

### Rejected alternatives

- **GraphQL.** Adds schema/resolver layer, N+1/caching concerns, and infra for flexibility we
  don't need: our data is page-shaped (creator page, product, taps, collabs), one first-party
  client set, no public API partners in v1. Revisit if we onboard many heterogeneous clients
  or a public partner API.
- **tRPC.** Best TS DX, but couples clients to server *types* rather than a versioned wire
  contract — weaker for a separately-shipped native app — and its client-fetching win barely
  applies when the public pages are server-rendered.

## Consequences

- **Positive:** one versioned, cacheable, language-agnostic contract for web islands and the
  native app; Zod gives runtime validation, inferred types, and (via generation) the OpenAPI
  doc from one definition; server rendering keeps its zero-HTTP fast path.
- **Trade-offs:** REST means we hand-shape endpoints (no free graph flexibility); we own an
  OpenAPI generation step when the native app work begins.
- **Deferred until the native app starts:** actually wiring the OpenAPI generator + client
  codegen. v1 only needs the REST handlers + Zod contracts, which already exist (the tap
  slice). No new dependency lands until `apps/mobile` does.

Superseding requires a new ADR referencing this one, plus an update to CLAUDE.md §6.
