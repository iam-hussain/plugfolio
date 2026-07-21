# CLAUDE.md — Engineering Guide for Plugfolio

This file tells any AI or human contributor **how we build Plugfolio**: what to follow,
how to keep the product docs true, and the code standards, architecture, and patterns
we hold to. Read it before writing code.

---

## 1. Source of truth — read before you build

Product intent lives in these docs. Read the relevant one **before** implementing a feature:

| Doc | What it governs | Authority |
|---|---|---|
| [`plugfolio-lean-journey.md`](./plugfolio-lean-journey.md) | **What ships first (v1).** The one core loop, the three roles, what's deferred. | **Primary — build this.** |
| [`docs/adr/`](./docs/adr/) | Committed technical decisions (stack, identity model, …). | Binding once *Accepted*. |
| [`docs/design/`](./docs/design/) | Page-by-page design briefs for designers (per v1 screen). | Design source for each page. |
| [`docs/implementation/`](./docs/implementation/) | Per-feature implementation notes (data model, API, components, edge cases). | Reference as you build. |

**If code and a doc disagree, stop and reconcile before continuing.** The lean journey wins for v1 scope.

> Note: the earlier heavy product docs (full features/journeys, product-owner brief, technical spec, competitive analysis) were removed in the pivot to the lean product. If a later phase needs that material, recover it from git history — don't reintroduce deferred scope without moving it into the lean journey first.

---

## 2. Golden rules (never break these silently)

1. **Follow the lean journey.** If a feature isn't in `plugfolio-lean-journey.md`'s v1, it's not in v1. To build something deferred, get it moved into v1 in the doc first.
2. **Shopping never requires an account.** No login wall on any buy path. Accounts gate only: follow, comment (shopper), selling (creator), hiring (business).
3. **v1 handles no money.** Creators use their own affiliate links; collab payment is off-platform. Do not add payment rails without a doc change.
4. **Docs stay true — update them in the same change.** See §3.
5. **Mobile-first, in-app-browser-fast.** Most visitors arrive inside Instagram/TikTok's browser. Every page must be fast and correct there.

---

## 3. Keep the product docs in sync — required, not optional

When your change alters scope, behavior, a journey, or a v1/deferred decision, **update the docs in the same PR**:

- **Behavior or journey change** → update `plugfolio-lean-journey.md`.
- **Pulling a deferred feature into v1, or deferring one** → move the row in the lean journey's "deliberately left out" table and adjust the affected journey.
- **Any non-trivial technical decision** (stack choice, data model, auth model, a pattern we commit to) → record it as an **ADR** in `docs/adr/NNNN-title.md` (see §9) and link it from the PR.
- **New/changed feature** → add or update an **implementation note** in `docs/implementation/<feature>.md` describing: the journey it serves, the data model, the API surface, the components, and edge cases.

> Rule of thumb: **a reviewer should be able to read the diff and the docs together and see one coherent story.** A code change with no matching doc update is incomplete when it touches product behavior.

Keep doc edits surgical — mirror the existing voice (neat, plain, scannable). Don't rewrite whole sections to add one line.

---

## 4. Stack (accepted — see [ADR-0001](./docs/adr/0001-tech-stack.md))

This is the committed baseline. It fits the product (SEO-able creator pages, mobile-first, fast in in-app browsers, no-login shopping). Changing it requires a new ADR that supersedes ADR-0001 and an update to this table.

| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript** (strict) everywhere | One language, typed contracts front-to-back. |
| Framework | **Next.js (App Router, RSC)** | Server components for fast, SEO-friendly public pages; one repo for web + API. |
| Styling | **Tailwind CSS** + design tokens (§7) | Fast, consistent, mobile-first; tokens keep the theme centralized. |
| UI primitives | **shadcn/ui** (Radix under the hood) | Accessible, themeable components we own the source of — the default; don't rebuild what it gives us (see §8). |
| State (client) | React Server Components first; **TanStack Query** for client data; local state via hooks | Fetch on the server by default; client state only where it earns its place. |
| Backend | **Standalone REST API (`apps/api`, Hono)** behind a same-origin proxy; Auth.js routes stay in `apps/web` (see [ADR-0008](./docs/adr/0008-standalone-api-service.md)) | Independent scale/deploy for the API; the service layer (§6) made the extraction a move, not a rewrite. |
| Database | **PostgreSQL** + **Prisma** | Relational data (creators, products, taps, collabs); typed queries. |
| Auth | **Auth.js (NextAuth)**; **email login for all account holders** (see [ADR-0004](./docs/adr/0004-creator-account-profiles-identity.md)) | Creators, shoppers & businesses sign in by email; a creator **account** connects Google+Meta and holds up to 5 **profiles**, each with a social-derived username; anonymous shoppers stay account-free. |
| Validation | **Zod** at every boundary | One schema validates input, types the result, and documents the contract. |
| Testing | **Vitest** (unit) + **Playwright** (e2e journeys) | Test the journeys from the docs, not just functions. |
| Hosting | **Vercel** | First-class Next.js; edge-fast public pages. |

Foundational decisions already recorded: [ADR-0001 (stack)](./docs/adr/0001-tech-stack.md) · [ADR-0002 (no-login shopper identity)](./docs/adr/0002-no-login-shopper-identity.md) · [ADR-0004 (creator account, profiles & social-connected identity)](./docs/adr/0004-creator-account-profiles-identity.md) *(supersedes ADR-0003)* · [ADR-0005 (monorepo structure)](./docs/adr/0005-monorepo-structure.md) *(amends ADR-0001)* · [ADR-0006 (REST API + mobile clients)](./docs/adr/0006-rest-api-and-mobile-clients.md) *(amends ADR-0001)* · [ADR-0007 (Auth.js identity tables)](./docs/adr/0007-authjs-identity-tables.md) *(amends ADR-0004)* · [ADR-0008 (standalone API service)](./docs/adr/0008-standalone-api-service.md) *(amends ADR-0005/0006)* · [ADR-0009 (member handles & comment identity)](./docs/adr/0009-member-handles-and-comment-identity.md) *(amends ADR-0004/0007)* · [ADR-0010 (per-profile categories)](./docs/adr/0010-per-profile-categories.md).

---

## 5. Frontend — feature-based architecture

**We use a monorepo** (pnpm workspaces + Turborepo — see [ADR-0005](./docs/adr/0005-monorepo-structure.md)). Two deployables (`apps/web` + `apps/api` — see [ADR-0008](./docs/adr/0008-standalone-api-service.md)); shared code lives in `packages/`:

```
apps/
  web/            # Next.js App Router — pages + Auth.js; proxies /api/* to apps/api. The feature-based src/ below lives here.
  api/            # standalone REST API (Hono) — thin shells over core services; mobile clients hit this directly.
packages/
  core/           # framework-free domain: entities, rules, services, Zod schemas, repository INTERFACES (§6). No Prisma/Next.
  db/             # Prisma schema + client + repository IMPLEMENTATIONS — the ONLY place Prisma is imported.
  ui/             # shadcn/ui primitives, themed via tokens (@plugfolio/ui).
  tokens/         # "Charged Violet" design tokens (§7) — CSS + TS, single source of color/space/type.
  config/         # shared tsconfig / tailwind / eslint / prettier presets.
```

**Organize by feature, not by file type.** Everything a feature needs lives together; shared code is explicitly shared. The frontend structure below lives inside **`apps/web/src/`**:

```
apps/web/src/
  app/                      # Next.js routes only — thin. Compose features, no business logic here.
    (public)/[handle]/      # creator page (no-login shopper surface)
    (public)/explore/
    (creator)/dashboard/
    (business)/collabs/
    api/auth/               # Auth.js routes (the only /api/* served by web — the rest proxies to apps/api, ADR-0008)
  features/                 # THE core. One folder per product capability.
    creator-page/
      components/           # feature-scoped UI
      hooks/                # feature-scoped hooks (use-...)
      api.ts                # client calls into backend for this feature
      types.ts             # feature types (Zod schemas + inferred types)
      index.ts              # public surface of the feature — import from here only
    product-tagging/
    shopper-account/        # follow + comment
    business-collab/
    earnings/
  components/
    ui/                     # shadcn/ui components (generated, then themed with our tokens) — do not hand-roll these
                            # other generic, product-agnostic UI we compose on top of ui/
  lib/                      # generic helpers (formatting, fetch client, date)
  server/                   # app-side backend seam (§6): env, http mapping, composition root wiring core services to db repos
  styles/                   # globals + tailwind bridge (tokens themselves live in @plugfolio/tokens)
  test/                     # shared test utils, fixtures
```

> `components/ui/` (shadcn) and `cn()` are shared across apps, so they live in **`@plugfolio/ui`**; the domain/services/repositories of §6 live in **`@plugfolio/core`** + **`@plugfolio/db`**. Import each package from its public `index` only.

**Rules:**
- **A feature owns its slice.** UI, hooks, types, and client API for one capability stay in `features/<name>/`.
- **Cross-feature imports go through `index.ts`.** Never reach into another feature's internals; import from its public surface.
- **`app/` is thin.** Routes wire features together and handle layout/loading/error boundaries — no business logic.
- **`components/` is generic only.** If a component knows about "creators" or "collabs," it belongs in a feature, not here.
- **Server-first.** Default to Server Components; add `"use client"` only for genuine interactivity (tagging editor, share sheet, forms).

---

## 6. Backend — patterns (best-practice suggestions)

Keep the backend a **thin transport shell over a typed domain**, so it survives being extracted from Next.js later. In the monorepo (§5, [ADR-0005](./docs/adr/0005-monorepo-structure.md)) the layers map onto packages:

```
packages/core/          # domain + services + Zod schemas + repository INTERFACES (framework-free, no DB imports)
  domain/               # entities & pure business rules
  services/             # use-cases: orchestrate domain + repositories (the "verbs")
  schemas/              # Zod schemas — validate at the boundary, infer the type inward
  ports/                # repository interfaces the services depend on
packages/db/            # repository IMPLEMENTATIONS — the ONLY place Prisma is imported
apps/web/src/server/    # http: request→service mapping, error → HTTP shape; env.ts; composition root
```

**Patterns we follow:**

1. **Layered, one direction.** `http → services → repositories → db`. Domain has zero framework/DB imports. No layer skips downward.
2. **Repository pattern.** All DB access behind repositories. Swapping/optimizing storage never touches services. Prisma is imported *only* in `repositories/`.
3. **Service = one use-case.** `tagProductToPost`, `recordOutboundTap`, `postBusinessRequirement`. Route handlers just: validate → call one service → shape response. Thin controllers.
4. **Validate at the boundary with Zod.** Parse every incoming payload; the parsed type flows inward. Never trust `req.body`.
5. **Typed errors, not thrown strings.** A `Result`/typed-error style or a small `AppError` hierarchy mapped to HTTP codes in one place. Callers handle known failure cases explicitly.
6. **Attribution is append-only.** Taps/clicks are immutable events (an event table), never mutated counters — the Earnings truth is a rebuildable projection. Label `tracked` vs `estimated` at the read model, per the docs.
7. **No-login shopper identity = a signed device token**, not an account row. Anonymous by default; only follow/comment/creator/business create real user records.
8. **Idempotency on writes that can retry** (tap recording, collab requests) via idempotency keys — in-app browsers double-fire.
9. **Config & secrets via env only**, validated by a single Zod-checked `env.ts` at boot. No secret in code, ever.
10. **Money stays out of v1.** No payment integration until a doc change says so (§2.3).
11. **REST, not GraphQL** (see [ADR-0006](./docs/adr/0006-rest-api-and-mobile-clients.md)). Client islands and the future native app consume versioned REST endpoints under `app/api/*`; the Zod boundary schema is the single contract source (OpenAPI + typed clients generate from it). Public RSC pages skip HTTP and call services directly.

---

## 7. Design system & theme — "Charged Violet"

Centralize the theme; components never hardcode hex/spacing.

- **Palette:** Charged Violet `#7C3AED` (primary) · Electric Lime `#C6FF3D` (one disciplined accent) · violet-tinted dark surfaces. Lime is a spark, not a background — use it sparingly (CTAs, highlights).
- **Tokens are the only source of color/space/type.** Define semantic tokens (`--color-primary`, `--color-accent`, `--surface`, `--text`, radius, spacing scale) in `@plugfolio/tokens` (`tokens.css`), exposed through Tailwind's theme via the shared preset in `@plugfolio/config`. **Components reference tokens, never raw hex.**
- **Type:** geometric display face for headings, clean sans for body. One scale, defined once.
- **Mobile-first & accessible:** design at 360px first; hit WCAG AA contrast (mind lime-on-light — it fails easily); every interactive element keyboard- and screen-reader-usable; respect `prefers-reduced-motion`.
- **Dark-first surfaces** (the brand is violet-tinted dark), but tokens must support a light mode cleanly.

---

## 8. Code standards

**General**
- **TypeScript strict.** No `any` (use `unknown` + narrow). Prefer `type` for shapes; `interface` for extendable contracts. Types inferred from Zod where a runtime boundary exists.
- **Small, pure, single-purpose functions.** A function does one thing; side effects live in services, not in components or utils.
- **Name for intent.** `recordOutboundTap`, not `handleClick2`. Booleans read as predicates (`isPublished`, `hasAffiliateLink`). No abbreviations that aren't domain terms.
- **No magic values.** Named constants/enums; strings that cross a boundary get a Zod enum.
- **Comments explain *why*, not *what*.** The code says what. Match the surrounding density.

**Components**
- **shadcn/ui first — always.** If shadcn/ui has a component for what you need (Button, Dialog, Sheet, Input, Select, Dropdown, Tabs, Toast, Table, …), **use it — do not build a custom one.** Add it with the shadcn CLI into `components/ui/`, then theme it via our tokens (§7). Only build a custom component when shadcn has **no** equivalent, and even then compose it from shadcn primitives where possible. Extend a shadcn component by wrapping it, not by forking a parallel version. Never reintroduce a hand-rolled Button/Modal/etc. that duplicates one shadcn already provides.
- **Function components + hooks only.** One component per file; the file is named for the component.
- **Props are a typed object**, destructured, with sensible defaults. Keep prop lists short — many props means the component should split.
- **Presentational vs. container.** Generic UI (`components/`, built on shadcn `components/ui/`) is presentational and stateless where possible; data-fetching/orchestration lives in feature components/hooks.
- **Accessibility is not optional.** Semantic HTML first; ARIA only to fill gaps; every control labeled and focusable.
- **Compose, don't prop-explode.** Prefer `children`/slots over a dozen config flags.

**Hooks & functions**
- Custom hooks are `use...`, own one concern, and return a stable, typed shape.
- Data fetching goes through the feature's `api.ts` + TanStack Query — components don't `fetch` inline.
- Pure helpers in `lib/` are framework-agnostic and unit-tested.

**Testing**
- **Test the journeys.** Each v1 journey in the lean doc has at least one Playwright path (shopper buys with no account; creator tags & publishes; business posts a requirement).
- Unit-test domain rules and pure utils with Vitest. Test behavior, not implementation detail.
- A bug fix ships with the test that would have caught it.

**Formatting**
- Prettier + ESLint (typescript-eslint, a11y, import-order). CI fails on lint/format/type errors. Don't hand-format around the formatter.

---

## 9. Decision records (ADRs)

Any decision that's expensive to reverse — stack, data model, auth model, a committed pattern — gets a short ADR:

```
docs/adr/0001-tech-stack.md
docs/adr/0002-no-login-shopper-identity.md
```

Format: **Context → Decision → Consequences → Status** (proposed / accepted / superseded). One page. Link it from the PR that implements it. When a later decision overrides an old one, mark the old ADR *superseded* — don't delete it.

---

## 10. Git & PR workflow

- **Branch** off the default branch; never commit product-behavior code without the matching doc/ADR update (§3).
- **Small, focused PRs**, each mapping to a journey step or feature slice where possible.
- **Commits** are imperative and explain *why* (`Add outbound-tap event recording for earnings attribution`).
- **PR body** states: what changed, which journey/doc it serves, which docs/ADRs were updated, and how it was verified.
- **CI green before merge:** type-check, lint, unit, and the relevant e2e journey.
- **Definition of done:** feature works on mobile-first, no login added to a shop path, docs updated, tests pass, ADR filed if a real decision was made.

---

## 11. Quick checklist before you open a PR

- [ ] Feature is in the lean journey's v1 (or the doc was updated to include it).
- [ ] No account required on any shopping path.
- [ ] No money/payment added without a doc change.
- [ ] Product doc(s) updated to match behavior; ADR filed if a real decision was made.
- [ ] Feature-based structure respected; generic vs. feature code in the right place.
- [ ] Backend change goes http → service → repository; Prisma only in repositories.
- [ ] Used shadcn/ui for anything it provides; no custom component duplicating a shadcn one.
- [ ] Theme via tokens, not hardcoded hex; mobile-first; AA contrast.
- [ ] Types strict, functions small and named for intent.
- [ ] Journey/unit tests added; CI green.
