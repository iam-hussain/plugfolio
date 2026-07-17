# ADR 0005 — Monorepo Structure (pnpm workspaces + Turborepo)

**Status:** Accepted

**Amends:** [ADR-0001 (tech stack)](./0001-tech-stack.md) — the stack choices there stand
unchanged; this ADR records _how the repository is organized_ to hold them.

## Context

ADR-0001 committed to "a single repo … a monolith that can be split later" and named an
explicit revisit trigger: _"we outgrow a single deployable (extract the `server/` domain into
a standalone service)."_ CLAUDE.md §5/§6 describe a feature-based `src/` with a layered,
framework-free backend (`domain → services → repositories`) whose stated goal is to be
**extractable from Next.js later**.

A flat single-app `src/` can express that layering by convention only — nothing _prevents_ a
component from importing Prisma, or the domain from importing Next. As the team and surface
grow (creator dashboard, business collabs, a possible native/admin surface), we want those
boundaries enforced by the module graph, and we want shared concerns (design tokens, UI kit,
config) owned in one place rather than copied.

## Decision

Organize the repository as a **monorepo** using **pnpm workspaces** for package linking and
**Turborepo** for the task graph and caching. One deployable in v1 (`apps/web`); shared code
lives in versioned-by-workspace packages.

```
apps/
  web/            # the only v1 deployable — Next.js App Router (RSC). Thin composition root.
packages/
  core/           # framework-free domain: entities, rules, services (use-cases),
                  #   Zod schemas, repository INTERFACES. No Prisma, no Next. The extractable backend.
  db/             # Prisma schema + client + repository IMPLEMENTATIONS. The ONLY place Prisma is imported (§6.2).
  ui/             # shadcn/ui primitives, themed via tokens (@plugfolio/ui).
  tokens/         # "Charged Violet" design tokens (§7) as CSS + TS — single source of color/space/type.
  config/         # shared tsconfig / tailwind / eslint / prettier presets.
```

**Why pnpm + Turborepo:** pnpm's content-addressed store keeps the isolated `node_modules`
that enforces our layering (a package can only import what it declares); Turborepo is
Vercel-native (ADR-0001 hosts on Vercel), giving cached `build`/`lint`/`typecheck`/`test`
across the graph with near-zero config.

**Why the `core` ↔ `db` split:** `core` declares repository _ports_ (interfaces) and depends
only on those; `db` provides the Prisma implementations. This makes CLAUDE.md §6's "Prisma
only in repositories" a compile-time fact, not a guideline, and turns ADR-0001's "extract the
domain later" from aspiration into a package you can lift out.

**Full split now** (rather than defer): the boundaries are cheap to create at day zero and
expensive to retrofit once features have grown across them.

## Consequences

- **Positive:** enforced layering (the domain _cannot_ import Prisma or Next); one home for
  tokens/UI/config consumed by every future app; Turborepo caching keeps CI fast; a second
  surface (native, admin, or an extracted API service) is `apps/<name>` reusing `core`/`ui`
  without a rewrite — exactly ADR-0001's revisit path.
- **Trade-offs:** more moving parts than a single app (workspace protocol, a preset package,
  `transpilePackages` in Next); contributors must respect package boundaries and import from
  a package's public `index`, not its internals (§5).
- **Neutral:** still one deployable in v1. The monorepo is structure, not distribution — it
  does not add services, infra, or scope.

## Feature-based structure still holds

CLAUDE.md §5's feature-based organization lives **inside `apps/web/src`** (`app/`,
`features/`, `components/`, `lib/`). The monorepo wraps that; it does not replace it. Backend
layers §6 map onto packages: `domain`/`services` → `core`, `repositories` → `db`, `http` →
`apps/web/src/server/http` + route handlers.

Superseding or further amending this requires a new ADR referencing this one, plus an update
to CLAUDE.md §5.
