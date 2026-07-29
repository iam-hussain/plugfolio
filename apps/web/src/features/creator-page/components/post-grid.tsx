import type { ShopperPost, ShopperProduct } from "@plugfolio/core";
import { cva } from "class-variance-authority";
import { Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

/**
 * The creator page's Shop wall (DESIGN creator.html §.grid): one grid holding
 * two kinds of tile — a **post** (photo + white product-count chip) and a
 * **product** the creator shelves directly with no post behind it (photo +
 * ink price chip + commercial flags). Square tiles, 2-up on a phone, 3-up from
 * 640px, 4-up from 1000px. Each tile answers "what do I get if I tap this".
 * Presentational; renders on the server.
 */
export type PostGridProps = {
  handle: string;
  posts: readonly ShopperPost[];
  /** Products with no post behind them (§.tile-pr) — shown as their own tiles. */
  products?: readonly ShopperProduct[];
};

const tileClass =
  "bg-muted rounded-image hover:shadow-rest relative block aspect-square overflow-hidden transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px]";

// The four commercial flags a product tile can carry (§.tile-flag). own stacks
// with an offer; in-store, offer and ended are mutually exclusive.
const flag = cva(
  "rounded-pill shadow-tag px-[9px] py-[5px] text-xs font-bold uppercase tracking-[0.04em]",
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

function ProductTile({ handle, product }: { handle: string; product: ShopperProduct }) {
  const price = formatPrice(product.priceCents, product.currency);
  const flags = flagsFor(product);
  return (
    <Link href={`/${handle}/product/${product.id}`} className={tileClass}>
      {product.imageUrl ? (
        /* ponytail: unoptimized until the social-import pipeline pins image domains */
        <Image src={product.imageUrl} alt={product.title} fill unoptimized className="object-cover" />
      ) : null}
      {/* No price chip when the price is unknown — never a zero (§.tile-pr). */}
      {price ? (
        <span className="bg-foreground text-background shadow-tag rounded-pill absolute right-2 top-2 px-2.5 py-[5px] text-xs font-extrabold tabular-nums">
          {price}
        </span>
      ) : null}
      {flags.length > 0 ? (
        <span className="absolute left-2 top-2 grid max-w-[calc(100%-70px)] justify-items-start gap-1">
          {flags.map((f) => (
            <span key={f.tone} className={flag({ tone: f.tone })}>
              {f.label}
            </span>
          ))}
        </span>
      ) : null}
    </Link>
  );
}

function PostTile({ handle, post }: { handle: string; post: ShopperPost }) {
  return (
    <Link href={`/${handle}/post/${post.id}`} className={tileClass}>
      {/* ponytail: unoptimized until the social-import pipeline pins image domains */}
      <Image src={post.mediaUrl} alt={post.caption ?? "Post"} fill unoptimized className="object-cover" />
      {post.products.length > 0 ? (
        <span className="bg-card text-foreground shadow-tag rounded-pill absolute right-2 top-2 inline-flex items-center gap-[5px] px-[9px] py-[5px] text-xs font-bold tabular-nums">
          <Tag className="text-primary size-[11px]" strokeWidth={2.5} aria-hidden />
          {post.products.length}
        </span>
      ) : null}
    </Link>
  );
}

export function PostGrid({ handle, posts, products = [] }: PostGridProps) {
  if (posts.length === 0 && products.length === 0) {
    return <p className="text-muted-foreground py-12 text-center text-sm">Nothing here yet.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 min-[1000px]:grid-cols-4 min-[1000px]:gap-3.5">
      {posts.map((post) => (
        <li key={`post-${post.id}`}>
          <PostTile handle={handle} post={post} />
        </li>
      ))}
      {products.map((product) => (
        <li key={`product-${product.id}`}>
          <ProductTile handle={handle} product={product} />
        </li>
      ))}
    </ul>
  );
}
