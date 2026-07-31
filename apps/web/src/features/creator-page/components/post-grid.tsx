import type { PageGridStyle, ShopperPost, ShopperProduct } from "@plugfolio/core";
import { cva } from "class-variance-authority";
import { Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

/** A list row gets one line of copy; a stacked card gets two. */
const cardCopy = cva("text-muted-foreground mt-1 overflow-hidden text-copy leading-[1.45]", {
  variants: { layout: { list: "line-clamp-1", stack: "line-clamp-2" } },
  defaultVariants: { layout: "stack" },
});

/**
 * The creator page's Shop wall (DESIGN creator.html §.grid): one grid holding
 * two kinds of tile — a **post** (photo + white product-count chip) and a
 * **product** the creator shelves directly with no post behind it (photo +
 * ink price chip + commercial flags). Each tile answers "what do I get if I
 * tap this". Presentational; renders on the server.
 *
 * Three layouts, the creator's choice (ADR-0017):
 * - `grid` — the tight photo wall. Most tiles on screen, no room for words.
 * - `cards` — roomier, with the title, a line of copy and the action word.
 * - `list` — one per row; easiest to scan on a phone.
 *
 * The words only exist in `cards` and `list`. That's why the action word
 * ("Open post", "Copy code, then buy") is written here rather than drawn on
 * the tile: in `grid` there is nowhere to put it, and the chip carries the
 * whole answer instead.
 */
export type PostGridProps = {
  handle: string;
  posts: readonly ShopperPost[];
  /** Products with no post behind them (§.tile-pr) — shown as their own tiles. */
  products?: readonly ShopperProduct[];
  layout?: PageGridStyle;
};

const grid = cva("list-none", {
  variants: {
    layout: {
      grid: "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 min-[1000px]:grid-cols-4 min-[1000px]:gap-3.5",
      cards: "grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5",
      list: "grid grid-cols-1 gap-2",
    },
  },
});

const tile = cva(
  "border-border bg-card group/tile relative block overflow-hidden no-underline transition-[transform,box-shadow] duration-200",
  {
    variants: {
      layout: {
        grid: "rounded-image hover:shadow-rest aspect-square hover:-translate-y-[3px]",
        cards: "rounded-tile hover:shadow-rest border p-2.5 hover:-translate-y-[3px]",
        list: "rounded-tile hover:border-primary flex items-center gap-3.5 border p-2.5",
      },
    },
  },
);

const media = cva("bg-muted relative block overflow-hidden", {
  variants: {
    layout: {
      grid: "size-full",
      cards: "rounded-image aspect-[4/3] w-full",
      list: "rounded-image size-16 shrink-0",
    },
  },
});

// The corner chips sit on the photo in grid/cards and beside the words in list.
const corner = cva("shadow-tag rounded-pill absolute z-10 text-micro", {
  variants: {
    layout: { grid: "right-2 top-2", cards: "right-[18px] top-[18px]", list: "hidden" },
  },
});

// The four commercial flags a product tile can carry (§.tile-flag). own stacks
// with an offer; in-store, offer and ended are mutually exclusive.
const flag = cva(
  "rounded-pill shadow-tag px-[9px] py-[5px] text-micro font-bold uppercase tracking-[0.04em]",
  {
    variants: {
      tone: {
        offer: "bg-accent text-accent-foreground",
        own: "bg-card text-primary",
        store: "bg-foreground text-background",
        ended: "border-border text-faint border bg-card",
      },
    },
  },
);

type Flag = { tone: "offer" | "own" | "store" | "ended"; label: string };

function flagsFor(product: ShopperProduct): Flag[] {
  const flags: Flag[] = [];
  if (product.kind === "own") flags.push({ tone: "own", label: "Their own" });
  const hasCoupon = product.couponCode !== null;
  const live = hasCoupon && (product.offerEndsAt === null || product.offerEndsAt > new Date());
  if (product.inStoreNote !== null) {
    flags.push({ tone: "store", label: "In-store code" });
  } else if (live) {
    flags.push({ tone: "offer", label: `Code ${product.couponCode}` });
  } else if (hasCoupon) {
    flags.push({ tone: "ended", label: "Offer ended" });
  }
  return flags;
}

/**
 * What tapping does, said in words. An in-store code has no link to open, so
 * the tile must not promise a shop it can't reach — the code IS the action.
 */
function actionFor(product: ShopperProduct): string {
  const live =
    product.couponCode !== null &&
    (product.offerEndsAt === null || product.offerEndsAt > new Date());
  if (product.inStoreNote !== null) return "Get the code →";
  if (product.kind === "own") return live ? "Copy code, then shop →" : "Shop their store →";
  return live ? "Copy code, then buy →" : "Buy →";
}

/** Title, copy and action — present only where the layout has room for words. */
function Words({
  layout,
  title,
  copy,
  action,
  note,
}: {
  layout: PageGridStyle;
  title: string;
  copy?: string | null;
  action: string;
  note?: string | null;
}) {
  if (layout === "grid") return null;
  const isList = layout === "list";
  return (
    <div className={isList ? "min-w-0 flex-1" : "px-1 pt-2.5"}>
      <b className="text-label block truncate font-bold leading-[1.35]">{title}</b>
      {copy ? <p className={cardCopy({ layout: isList ? "list" : "stack" })}>{copy}</p> : null}
      <span className="text-primary text-label mt-2 block font-bold">{action}</span>
      {note && !isList ? (
        <span className="text-faint text-micro mt-1.5 block leading-[1.4]">{note}</span>
      ) : null}
    </div>
  );
}

function ProductTile({
  handle,
  product,
  layout,
}: {
  handle: string;
  product: ShopperProduct;
  layout: PageGridStyle;
}) {
  const price = formatPrice(product.priceCents, product.currency);
  const flags = flagsFor(product);
  return (
    <Link href={`/${handle}/product/${product.id}`} className={tile({ layout })}>
      <span className={media({ layout })}>
        {product.imageUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            unoptimized
            className="object-cover"
          />
        ) : null}
      </span>
      {/* No price chip when the price is unknown — never a zero (§.tile-pr). */}
      {price ? (
        <span
          className={`${corner({ layout })} bg-foreground text-background px-2.5 py-[5px] font-extrabold tabular-nums`}
        >
          {price}
        </span>
      ) : null}
      {flags.length > 0 ? (
        <span
          className={
            layout === "list"
              ? "flex shrink-0 flex-wrap justify-end gap-1"
              : `absolute z-10 grid max-w-[calc(100%-70px)] justify-items-start gap-1 ${layout === "cards" ? "left-[18px] top-[18px]" : "left-2 top-2"}`
          }
        >
          {flags.map((f) => (
            <span key={f.tone} className={flag({ tone: f.tone })}>
              {f.label}
            </span>
          ))}
        </span>
      ) : null}
      <Words
        layout={layout}
        title={product.title}
        action={actionFor(product)}
        note={product.inStoreNote}
      />
      {layout === "list" && price ? (
        <span className="text-foreground text-label shrink-0 font-extrabold tabular-nums">
          {price}
        </span>
      ) : null}
    </Link>
  );
}

function PostTile({
  handle,
  post,
  layout,
}: {
  handle: string;
  post: ShopperPost;
  layout: PageGridStyle;
}) {
  const tagged = post.products.length;
  return (
    <Link href={`/${handle}/post/${post.id}`} className={tile({ layout })}>
      <span className={media({ layout })}>
        {/* ponytail: unoptimized until the social-import pipeline pins image domains */}
        <Image
          src={post.mediaUrl}
          alt={post.caption ?? "Post"}
          fill
          unoptimized
          className="object-cover"
        />
      </span>
      {tagged > 0 ? (
        <span
          className={`${corner({ layout })} bg-card text-foreground inline-flex items-center gap-[5px] px-[9px] py-[5px] font-bold tabular-nums`}
          aria-label={`${tagged} ${tagged === 1 ? "product" : "products"} tagged`}
        >
          <Tag className="text-primary size-[11px]" strokeWidth={2.5} aria-hidden />
          {tagged}
        </span>
      ) : null}
      <Words
        layout={layout}
        // A post with no caption falls back to the handle, so a titled layout
        // never renders a nameless card (ADR-0017 consequence).
        title={post.caption ?? `@${handle}`}
        action="Open post →"
      />
      {layout === "list" && tagged > 0 ? (
        <span className="text-muted-foreground text-micro shrink-0 font-bold tabular-nums">
          {tagged} tagged
        </span>
      ) : null}
    </Link>
  );
}

export function PostGrid({ handle, posts, products = [], layout = "grid" }: PostGridProps) {
  if (posts.length === 0 && products.length === 0) {
    return <p className="text-muted-foreground text-copy py-12 text-center">Nothing here yet.</p>;
  }

  return (
    <ul className={grid({ layout })}>
      {posts.map((post) => (
        <li key={`post-${post.id}`}>
          <PostTile handle={handle} post={post} layout={layout} />
        </li>
      ))}
      {products.map((product) => (
        <li key={`product-${product.id}`}>
          <ProductTile handle={handle} product={product} layout={layout} />
        </li>
      ))}
    </ul>
  );
}
