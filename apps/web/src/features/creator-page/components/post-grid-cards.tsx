import type { PageGridStyle, ShopperPost, ShopperProduct } from "@plugfolio/core";
import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

/**
 * The two card kinds the creator wall holds — a **post** (media + what it
 * costs, with a play badge when it's a video) and a standalone **product**
 * ("Thing" pill — shelved with no post behind it) — plus the small parts they
 * share (media/answer-row layout, the badges). Split out of `post-grid.tsx` so
 * the grid file is the list-and-layout seam and this file is the cards.
 * Presentational; renders on the server.
 */

const card = cva(
  "border-border bg-card group/card relative block overflow-hidden border no-underline transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-primary",
  {
    variants: {
      layout: {
        grid: "rounded-md",
        cards: "rounded-row",
        list: "rounded-row flex items-center gap-3 p-2.5",
      },
    },
  },
);

const media = cva("bg-active relative block overflow-hidden", {
  variants: {
    layout: {
      grid: "aspect-square w-full",
      cards: "h-[150px] w-full lg:h-[200px]",
      list: "rounded-md size-[88px] shrink-0",
    },
  },
});

/** The 24px ink play badge a video post wears, top-left on the media. */
function PlayBadge() {
  return (
    <span
      aria-label="Video"
      className="bg-brand-ink/75 rounded-pill absolute left-2 top-2 flex size-6 items-center justify-center text-white"
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
        <polygon points="3,1.5 10,6 3,10.5" />
      </svg>
    </span>
  );
}

/** The "Thing" pill a standalone product wears, top-right on the media. */
function ThingPill() {
  return (
    <span className="bg-background border-border text-foreground text-pico tracking-eyebrow rounded-pill absolute right-2 top-2 border px-2 py-1 font-mono font-bold uppercase">
      Thing
    </span>
  );
}

/** Price · live code chip · meta — the card's one answer row. */
function AnswerRow({
  price,
  code,
  meta,
}: {
  price: string;
  code?: string | null;
  meta?: string | null;
}) {
  return (
    <span className="mt-[7px] flex flex-wrap items-center gap-2">
      <span className="font-display text-label font-semibold tabular-nums">{price}</span>
      {code ? (
        <span className="bg-accent text-accent-foreground text-pico rounded-[6px] px-[7px] py-[3px] font-mono font-bold tracking-[0.08em]">
          {code}
        </span>
      ) : null}
      {meta ? <span className="text-faint text-nano">{meta}</span> : null}
    </span>
  );
}

function liveCode(product: ShopperProduct | undefined | null): string | null {
  if (!product?.couponCode) return null;
  const live = product.offerEndsAt === null || product.offerEndsAt > new Date();
  return live ? product.couponCode : null;
}

export function ProductCard({
  handle,
  product,
  layout,
}: {
  handle: string;
  product: ShopperProduct;
  layout: PageGridStyle;
}) {
  const price = formatPrice(product.priceCents, product.currency) ?? "Price on the store";
  return (
    <Link href={`/${handle}/product/${product.id}`} className={card({ layout })}>
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
        {layout !== "list" ? <ThingPill /> : null}
      </span>
      {layout !== "grid" ? (
        <span className={layout === "list" ? "min-w-0 flex-1" : "block px-3 pb-[13px] pt-[11px]"}>
          <span className="text-label block overflow-hidden font-medium leading-[1.4] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]">
            {product.title}
          </span>
          <AnswerRow
            price={price}
            code={liveCode(product)}
            meta={product.inStoreNote !== null ? "In-store" : null}
          />
        </span>
      ) : null}
    </Link>
  );
}

export function PostCard({
  handle,
  post,
  layout,
}: {
  handle: string;
  post: ShopperPost;
  layout: PageGridStyle;
}) {
  const first = post.products[0] ?? null;
  const price = first
    ? (formatPrice(first.priceCents, first.currency) ?? "Price on the store")
    : "Nothing tagged";
  const more = post.products.length > 1 ? `+${post.products.length - 1} more` : null;
  return (
    <Link href={`/${handle}/post/${post.id}`} className={card({ layout })}>
      <span className={media({ layout })}>
        {/* ponytail: unoptimized until the social-import pipeline pins image domains */}
        <Image
          src={post.mediaUrl}
          alt={post.caption ?? "Post"}
          fill
          unoptimized
          className="object-cover"
        />
        {post.mediaKind !== "still" ? <PlayBadge /> : null}
      </span>
      {layout !== "grid" ? (
        <span className={layout === "list" ? "min-w-0 flex-1" : "block px-3 pb-[13px] pt-[11px]"}>
          <span className="text-label block overflow-hidden font-medium leading-[1.4] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]">
            {/* A post with no caption falls back to the handle, so a titled
                layout never renders a nameless card (ADR-0017 consequence). */}
            {post.caption ?? `@${handle}`}
          </span>
          <AnswerRow price={price} code={liveCode(first)} meta={more} />
        </span>
      ) : null}
    </Link>
  );
}
