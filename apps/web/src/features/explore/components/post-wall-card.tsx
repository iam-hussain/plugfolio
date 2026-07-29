import type { DiscoveryPost } from "@plugfolio/core";
import { ProductTag } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

/**
 * A post tile on the explore wall (DESIGN explore.html §.wp): a colour tile
 * carrying the photo with its price tags pinned on it — the tag IS the control
 * (tap it → the product), the photo taps through to the post. Tilts at rest,
 * straightens on hover. Tag coordinates aren't stored, so the three shown are
 * pinned at staggered preset spots; a "+N more" pill collapses the rest.
 */
const TILE_BG = [
  "bg-tile-lavender",
  "bg-tile-sky",
  "bg-tile-butter",
  "bg-tile-blush",
  "bg-tile-mint",
  "bg-tile-coral",
] as const;
const TILT = ["-rotate-[1.5deg]", "rotate-[1.4deg]", "-rotate-1", "rotate-[1.8deg]"] as const;
const TAG_POS = ["top-[24%] left-[8%]", "top-[64%] left-[40%]", "top-[48%] left-[14%]"] as const;

export function PostWallCard({ post, index }: { post: DiscoveryPost; index: number }) {
  const more = post.productCount - post.tags.length;

  return (
    <article
      className={`${TILE_BG[index % TILE_BG.length]} ${TILT[index % TILT.length]} shadow-rest rounded-card p-2 transition-transform duration-300 ease-out hover:z-10 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-lift`}
    >
      <div className="relative">
        <Link
          href={`/${post.username}/post/${post.id}`}
          aria-label={`Open @${post.username}'s post`}
          className="rounded-image block overflow-hidden"
        >
          <Image
            src={post.mediaUrl}
            alt=""
            width={900}
            height={1125}
            unoptimized
            className="block aspect-[4/5] w-full object-cover"
          />
        </Link>
        {post.tags.map((tag, tagIndex) => (
          <Link
            key={tag.productId}
            href={`/${post.username}/product/${tag.productId}`}
            aria-label={`${tag.name} — ${formatPrice(tag.priceCents, tag.currency) ?? "view"}`}
            className={`absolute ${TAG_POS[tagIndex]}`}
          >
            <ProductTag
              tone={tag.tone}
              name={tag.name}
              price={formatPrice(tag.priceCents, tag.currency) ?? ""}
            />
          </Link>
        ))}
        {more > 0 ? (
          <Link
            href={`/${post.username}/post/${post.id}`}
            className="bg-foreground text-background shadow-tag rounded-pill absolute bottom-[8%] left-[16%] inline-flex min-h-11 items-center gap-1 px-3.5 text-[13px] font-semibold no-underline"
          >
            {more} more ›
          </Link>
        ) : null}
      </div>
      <Link
        href={`/${post.username}`}
        className="text-tile-foreground flex items-center gap-2 px-1.5 pt-3 pb-1 no-underline"
      >
        <span className="bg-card text-foreground grid size-6 shrink-0 place-items-center rounded-pill text-[10px] font-bold">
          {post.username.charAt(0).toUpperCase()}
        </span>
        <span className="truncate text-[13px] font-semibold">@{post.username}</span>
        <span className="ml-auto text-[11px] font-bold tabular-nums opacity-80">
          {post.productCount > 0
            ? `${post.productCount} thing${post.productCount === 1 ? "" : "s"}`
            : "Nothing tagged"}
        </span>
      </Link>
    </article>
  );
}
