import type { DiscoveryPost } from "@plugfolio/core";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

/**
 * A post on Explore (v2, `Plugfolio v2.dc.html` §explore) — the photograph
 * with the ink tag-count pill on it, then who it's by, the caption, and the
 * card's answer row: the first tagged price plus how many more wait inside.
 * The whole card opens the post; the products are one screen further, where
 * the tap is measured.
 */
export function PostCard({ post }: { post: DiscoveryPost }) {
  const [lead] = post.tags;
  const price = lead ? (formatPrice(lead.priceCents, lead.currency) ?? "Price on the store") : "—";
  const more = post.productCount > 1 ? `+${post.productCount - 1} more` : null;
  return (
    <Link
      href={`/${post.username}/post/${post.id}`}
      className="border-border bg-card rounded-tile hover:border-primary block overflow-hidden border no-underline transition-[transform,border-color] duration-150 hover:-translate-y-0.5"
    >
      <span className="bg-active relative block h-[190px] overflow-hidden">
        {/* ponytail: unoptimized until the social-import pipeline pins image domains */}
        <Image src={post.mediaUrl} alt="" fill unoptimized className="object-cover" />
        <span className="bg-brand-ink/80 text-pico absolute left-2.5 top-2.5 rounded-pill px-2.5 py-[5px] font-mono font-bold tracking-[0.06em] text-white">
          {post.productCount > 0 ? `${post.productCount} tagged` : "nothing tagged"}
        </span>
      </span>
      <span className="block px-3.5 pb-3.5 pt-3">
        <span className="text-faint text-micro block truncate">@{post.username}</span>
        <span className="text-label mt-1 block overflow-hidden leading-[1.45] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {post.caption ?? "See what's tagged"}
        </span>
        <span className="mt-2.5 flex items-center justify-between gap-2">
          <span className="font-display text-label font-semibold tabular-nums">{price}</span>
          {more ? <span className="text-faint text-nano">{more}</span> : null}
        </span>
      </span>
    </Link>
  );
}
