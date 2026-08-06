import type { PageGridStyle, ShopperPost, ShopperProduct } from "@plugfolio/core";
import { cva } from "class-variance-authority";
import { PostCard, ProductCard } from "./post-grid-cards";

/**
 * The creator page's wall (v2, docs/design/v2-visual-system.md §Signature
 * moves): one grid holding two kinds of card — a **post** (media + what it
 * costs, with a play badge when it's a video) and a standalone **product**
 * ("Thing" pill — the creator shelves it with no post behind it). Each card
 * answers "what do I get if I tap this". Presentational; renders on the
 * server. The cards themselves live in `post-grid-cards.tsx`.
 *
 * Three layouts, the creator's choice (ADR-0017, amended by ADR-0026):
 * - `grid` — the tight photo wall: media only, 6px gaps, most posts on screen.
 * - `cards` — roomier: media then title, price and the live code.
 * - `list` — one 88px-thumb row per card; easiest to scan on a phone.
 */
export type PostGridProps = {
  handle: string;
  posts: readonly ShopperPost[];
  /** Products with no post behind them — shown as their own cards. */
  products?: readonly ShopperProduct[];
  layout?: PageGridStyle;
};

const grid = cva("list-none", {
  variants: {
    layout: {
      grid: "grid grid-cols-2 gap-1.5 sm:grid-cols-3",
      cards: "grid grid-cols-2 gap-3 sm:grid-cols-3",
      list: "grid grid-cols-1 gap-3",
    },
  },
});

export function PostGrid({ handle, posts, products = [], layout = "grid" }: PostGridProps) {
  if (posts.length === 0 && products.length === 0) {
    return <p className="text-muted-foreground text-copy py-12 text-center">Nothing here yet.</p>;
  }

  return (
    <ul className={grid({ layout })}>
      {posts.map((post) => (
        <li key={`post-${post.id}`}>
          <PostCard handle={handle} post={post} layout={layout} />
        </li>
      ))}
      {products.map((product) => (
        <li key={`product-${product.id}`}>
          <ProductCard handle={handle} product={product} layout={layout} />
        </li>
      ))}
    </ul>
  );
}
