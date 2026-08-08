# Plugfolio

A shoppable creator platform. A creator turns their content into a page where every
post is shoppable; a follower taps a post and buys — **no account, no friction**.

## The product

Plugfolio v1 is deliberately lean — one core loop, three roles, everything else
deferred:

- **Shopper** — buys with no account; signs in only to follow or comment.
- **Creator** — connects Instagram, tags products on posts, publishes one shoppable page.
- **Business** — posts a requirement or reaches out to a creator, then bargains a collab.

## Docs

| Doc | What it is |
|---|---|
| [`plugfolio-lean-journey.md`](./plugfolio-lean-journey.md) | **The product.** The v1 journeys, roles, and what's deferred. Start here. |
| [`CLAUDE.md`](./CLAUDE.md) | How we build it — architecture, code standards, and the docs-in-sync workflow. |
| [`docs/adr/`](./docs/adr/) | Committed technical decisions (stack, identity model). |

## Repository

A monorepo — pnpm workspaces + Turborepo ([ADR-0005](./docs/adr/0005-monorepo-structure.md)). Three deployables over shared packages:

```
apps/web         # the public + creator + business app — Next.js App Router (RSC); owns Auth.js, proxies /api/* to apps/api
apps/api         # the standalone REST API (Hono) — thin controllers over core services; mobile clients hit this directly (ADR-0008)
apps/admin       # internal ops console (Next.js) — talks to the DB directly via core + db, separate AdminUser identity (ADR-0014)
packages/core    # framework-free domain: services, Zod schemas, repository interfaces
packages/db      # Prisma schema + client + repository implementations (the only place Prisma is imported)
packages/ui      # shadcn/ui primitives + shared visual components, themed via tokens
packages/tokens  # "Plugfolio v2" design tokens (ADR-0026)
packages/config  # shared tsconfig / tailwind / eslint / prettier presets
```

**How they talk.** A public shopper page renders on the server in `apps/web` and calls the read services in `packages/core` directly — no HTTP hop. Every write (and the future native app) goes through the versioned REST API in `apps/api`; `apps/web` proxies `/api/*` to it so both share one path. `apps/admin` skips the API and reads/writes the database through `core` + `db`. All three wire the same domain services to Prisma repositories in their own `server/container.ts` composition root.

## Getting started

Requires pnpm 10+. The Node version is pinned in [`.nvmrc`](./.nvmrc) — the same
file CI reads, so local and CI stay on one version.

```bash
nvm use                                         # switch to the Node version in .nvmrc (nvm install if needed)
corepack enable                                 # use the pnpm version pinned in package.json
pnpm install
cp apps/web/.env.example apps/web/.env.local    # set DATABASE_URL + DEVICE_TOKEN_SECRET
cp packages/db/.env.example packages/db/.env    # DATABASE_URL for Prisma CLI
pnpm db:generate                                # generate the Prisma client
pnpm --filter @plugfolio/db db:migrate          # apply migrations to your database
pnpm --filter @plugfolio/db db:seed             # seed @lena + a tappable product
pnpm dev                                         # run every app (turbo), then visit /lena
```

Run a single app instead of the whole graph:

```bash
pnpm --filter @plugfolio/web dev                # the public + creator + business app
pnpm --filter @plugfolio/api dev                # the standalone REST API
pnpm --filter @plugfolio/admin dev              # the internal ops console
```

Common tasks (Turborepo runs them across the graph):

```bash
pnpm build                       # build all
pnpm typecheck                   # type-check all
pnpm lint                        # lint all
pnpm test                        # unit tests (Vitest)
pnpm --filter @plugfolio/web test:e2e   # Playwright shopper journeys
```

## Status

The v1 journeys are built across all three apps — the no-login shopper surface, the
creator back room (posts, product tagging, categories, traffic), business collabs, shopper
accounts (follow, watchlist, comments), and the internal ops console — on the v2 visual
system ([ADR-0026](./docs/adr/0026-v2-visual-redesign.md)). Unit tests (Vitest) and the
Playwright shopper journeys run green in CI. See [`CLAUDE.md`](./CLAUDE.md) before contributing.
