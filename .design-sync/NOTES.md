# design-sync notes — @plugfolio/ui → claude.ai/design

Project: **Plugfolio Design System** (`acbe2039-06b0-4728-a52a-2b88125cad84`).
Shape: **storybook** (`@storybook/react-vite`, config in `apps/web/.storybook`).

> A prior partial sync (commit `c361a5d`) committed a minimal `config.json`
> pinning this project + the design-sync `.gitignore` entries, but never uploaded
> or left NOTES. This run completed the full sync (33 components verified,
> anchored). Future runs are true re-syncs — the driver flow in `.ds-sync/resync.mjs`.

## Repo gotchas (read before re-syncing)

- **[GENERAL] `@plugfolio/ui` ships raw TS source — no dist, no `.d.ts`.** The
  converter enumerates components + props from `.d.ts`, so we generate one:
  `buildCmd` runs `tsc --emitDeclarationOnly` into `packages/ui/dist/` and
  `packages/ui/package.json` was given `"types": "./dist/index.d.ts"` so the
  converter finds it. `packages/ui/dist/` is gitignored. **If you drop the
  `types` field the export surface goes empty and every storybook title
  unmaps.** `--node-modules apps/web/node_modules` (ui's own node_modules has
  `react` but not `react-dom`); the entry is `--entry packages/ui/src/index.ts`.
- **[GENERAL] Vite storybook inlines the compiled Tailwind CSS into JS**, so the
  converter's `<link>`-scrape finds no stylesheet (`[CSS_PLACEHOLDER]`). We point
  `cssEntry` at a copy of the compiled CSS. `buildCmd` copies the largest
  `.css` out of `.design-sync/sb-reference/assets/` to
  `packages/ui/dist/ds-styles.css` after emitting types. `cssEntry` MUST be
  inside the package (a `../../.design-sync/…` path is rejected as "outside the
  package") — hence it lives under `dist/`.
- **[GENERAL] The `.storybook/preview.tsx` theme decorator doesn't bundle.**
  `@storybook/addon-themes`' `withThemeByDataAttribute` isn't a stubbed export,
  so decorator-bundled previews all threw `is not a function`. Fix: `cfg.provider`
  → `PreviewShell` (`.design-sync/preview-shell.tsx`, exposed via `extraEntries`).
  It reproduces both decorators: sets `data-theme="dark"` on `<html>` (dark tokens
  are scoped `:root[data-theme="dark"]`; the reference storybook renders
  `defaultTheme:"dark"`, so previews MUST be dark to grade clean) and wraps in the
  page surface (`bg-background text-foreground font-sans`, `p-8`).
- **Storybook titles ≠ export names.** `titleMap` maps the space-stripped title
  segment → real export (e.g. `Actionform`→`ActionForm`). 9 composition-showcase
  stories are mapped to a representative lead export (Wall→`PostWall`,
  Persuade→`LoopSteps`, Media→`MediaSlot`, Detail→`ProductDetail`,
  Forms→`AuthForm`, Backroom→`DashCard`, Parts→`CommentSection`, plus the
  eponymous `SharePanel`/`CollabThread`).
- **9 storybook titles excluded (`titleMap: null`)** — they render `@/features` or
  `@/components` subjects that are NOT in the `@plugfolio/ui` bundle (Product card=
  `TaggedProductCard`, Shop grid=`PostGrid`, Account=`AccountPage`, Following=
  `FollowingPage`, Auth Status/Shell = feature versions, Shopper tab bar=
  `@/components`), or are token-only foundations with no export (Color, Type).
- **`[TOKENS_MISSING]` (non-blocking)**: `--tw-*`/`--spacing` are Tailwind runtime
  vars (expected absent); `--sidebar-*` and bare `--primary`/`--muted`/`--foreground`
  are referenced by some shadcn primitives. All 33 render; watch Sidebar and any
  shadcn-heavy component during grading in case a scope is genuinely missing.

## Re-sync risks (what can silently go stale)

- **`packages/ui/dist/` (types + `ds-styles.css`) is generated, gitignored.** A
  fresh clone MUST run `buildCmd` (the driver does) AND rebuild
  `.design-sync/sb-reference` first (the CSS copy reads from it). If sb-reference
  is stale/absent, `buildCmd`'s CSS-copy step throws.
- **`packages/ui/package.json` `types` field is a repo edit this sync introduced.**
  It's harmless (source still ships via `exports`) but if a future cleanup removes
  it, the sync breaks — see the first gotcha.
- **Composition-showcase cards carry a mild name/API mismatch**: the card renders a
  full page section but its `.d.ts`/`.prompt.md` describe only the lead export
  (e.g. ProductDetail's props for the whole product-view story). Deliberate — user
  chose to include them. Don't "fix" by swapping props; they render correctly.
- **Previews are dark-only** (to match the dark reference). The DS is
  light-committed; the shipped cards are dark thumbnails by design.
- **Fonts load from Google Fonts CDN** (`styles.css` remote `@import`: Sora, Inter,
  Space Mono) — not shipped in the bundle. `[FONT_REMOTE]`, not `[FONT_MISSING]`.
  Note the storybook uses **Inter**, not Manrope (which DESIGN.md/§7 names) — the
  repo's actual state.
- **Story caps (partially verified):** all 33 components graded `match` on their
  captured stories (first sync, no `.tsx` fixes anywhere). Two composition cards
  exceed the default 6-story capture cap and their TAIL stories were not
  individually graded — `DashCard` (14 stories, 6 graded) and `CollabThread` (7,
  6 graded). They're verified-by-upload; raise `compare.mjs --max-stories` on a
  future sync if a tail dashboard/collab variant needs explicit checking.
- **Grading tip (from batch-c):** at contact-sheet scale, an outline-strong dark
  card fill (`bg-card #231F33`) can read as bright violet (`bg-primary #7C3AED`).
  Pixel-sample the raw PNG before grading any single-element colour delta.
