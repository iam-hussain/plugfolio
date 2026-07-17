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

A monorepo — pnpm workspaces + Turborepo ([ADR-0005](./docs/adr/0005-monorepo-structure.md)).

```
apps/web         # the v1 deployable — Next.js App Router (RSC)
packages/core    # framework-free domain: services, Zod schemas, repository interfaces
packages/db      # Prisma schema + client + repository implementations
packages/ui      # shadcn/ui primitives, themed via tokens
packages/tokens  # "Charged Violet" design tokens
packages/config  # shared tsconfig / tailwind / eslint / prettier presets
```

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
pnpm dev                                         # run the web app
```

Common tasks (Turborepo runs them across the graph):

```bash
pnpm build       # build all
pnpm typecheck   # type-check all
pnpm lint        # lint all
pnpm test        # unit tests (Vitest)
```

## Status

Scaffold in place: the monorepo, shared packages, and one end-to-end vertical slice
(`recordOutboundTap`: route handler → service → repository) build and test green. Feature
slices land next. See [`CLAUDE.md`](./CLAUDE.md) before contributing.
