## Building with Plugfolio UI

Plugfolio is a **mobile-first creator-commerce** design system — "The Tagged
Feed": a violet-tinted near-white canvas, oversized Sora headlines, and product
photos living inside saturated colour tiles. Components are React function
components (shadcn/Radix under the hood) styled entirely with **Tailwind utility
classes bound to semantic design tokens**. Compose your own layout with the same
token classes — never hand-pick hex, raw `text-[13px]` sizes, or Tailwind's
default `text-sm/base/lg` scale (a second scale the system deliberately avoids).

### Setup (do this once)
- The bound stylesheet is **`styles.css`** — it `@import`s the compiled component
  CSS (`_ds_bundle.css`) and the brand webfonts (Sora / Inter / Space Mono).
  Everything visual flows from it; read it before styling.
- **Theme:** tokens default to **light** at `:root` (the committed "daylight"
  brand). For dark, set `data-theme="dark"` on the root element
  (`document.documentElement`). Both themes are complete — style for both.
- Never wrap the page in a white background: the ground is **`bg-background`**
  (canvas); white (`bg-card`) is a *lift* for raised cards, inputs, and tag pills.

### The styling idiom — real token classes (all defined in `_ds_bundle.css`)
- **Surfaces:** `bg-background` (page), `bg-card` (raised/white lift),
  `bg-muted`, `bg-active` (violet-wash selected). Text: `text-foreground` (ink),
  `text-muted-foreground` (labels), `text-primary` (violet).
- **Action:** `bg-primary` + `text-primary-foreground` — the ink→violet button.
- **Offer accent (lime, fill only):** `bg-accent` + `text-accent-foreground` —
  use ONLY where there is a real coupon/deal, never as a text colour.
- **Tiles (content colour):** `bg-tile-butter | -mint | -sky | -lavender |
  -coral | -blush` with `text-tile-foreground`. Colour arrives as a Tile behind
  content — never as a border, gradient, or full-page wash. Never nest tiles.
- **Borders/focus:** `border-border`, `ring-ring`.
- **Radius (climbs with the object):** `rounded-image` (16) · `rounded-tile`
  (20) · `rounded-card` (26) · `rounded-bay` (34) · `rounded-pill` (anything
  interactive). **Elevation:** `shadow-rest` (cards), `shadow-tag` (pills on
  imagery), `shadow-lift` (hover). No glass/blur.
- **Type — off the named scale only:** `text-micro · text-label · text-copy ·
  text-body · text-title · text-name · text-display` (+ `-sm/-lg` steps).
  **Fonts:** `font-display` (Sora, headlines) · `font-sans` (Inter, UI/body,
  tabular nums for prices) · `font-mono` (Space Mono, data). Spacing is 4-based.

### Where the truth lives
- **`styles.css`** and its `@import` closure — the tokens and every component's
  compiled styles.
- **Per-component `<Name>.prompt.md` + `<Name>.d.ts`** — the API and real usage
  examples. Compound components expose sub-parts (e.g. `Panel` +
  `PanelHeader`/`PanelBody`, `Card` + `CardHeader`).
- The **signature primitives `ProductTag`** (white price pill pinned on a photo)
  and **`Tile`** (`tone="butter|mint|sky|lavender|coral|blush"`) are importable
  from the library and appear *inside* the composition cards (PostWall,
  ProductDetail, MediaSlot) rather than as standalone cards — read those for how
  they're used.
- Some cards (PostWall, ProductDetail, CreatorHeader, MediaSlot, LoopSteps,
  DashCard, CommentSection) are **page-section compositions** — read them as
  layout references; their `.d.ts` describes the lead component only.

### One idiomatic snippet
```tsx
<div className="bg-background text-foreground font-sans p-6">
  <Card className="rounded-card shadow-rest">
    <CardHeader className="text-title font-display">Your picks</CardHeader>
    <div className="grid grid-cols-2 gap-4">
      <Tile tone="mint" className="rounded-tile p-4 text-tile-foreground">…</Tile>
      <Button>Shop now</Button>            {/* ink → violet on hover */}
    </div>
  </Card>
</div>
```
