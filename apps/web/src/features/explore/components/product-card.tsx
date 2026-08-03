import type { DiscoveryProduct } from "@plugfolio/core";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

/**
 * A thing on Explore (v2, `Plugfolio v2.dc.html` §explore) — the photograph,
 * who tagged it, its name, then the answer row: the price, the "Their own"
 * mark when the creator sells it themselves, and the lime code when a live
 * offer rides it. The card opens the PRODUCT page: the outbound tap and its
 * attribution happen one screen later, so discovery never records a buy that
 * didn't start.
 */
export function ProductCard({ product }: { product: DiscoveryProduct }) {
  const couponActive =
    product.couponCode !== null && (!product.offerEndsAt || product.offerEndsAt > new Date());
  return (
    <Link
      href={`/${product.username}/product/${product.id}`}
      className="border-border bg-card rounded-tile hover:border-primary block overflow-hidden border no-underline transition-[transform,border-color] duration-150 hover:-translate-y-0.5"
    >
      <span className="bg-active relative block h-[150px] overflow-hidden">
        {product.imageUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image src={product.imageUrl} alt="" fill unoptimized className="object-cover" />
        ) : null}
      </span>
      <span className="block px-3.5 pb-3.5 pt-3">
        <span className="text-faint text-nano block truncate">@{product.username}</span>
        <span className="text-label mt-[3px] block truncate font-medium leading-[1.35]">
          {product.title}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-2">
          <span className="font-display text-label font-semibold tabular-nums">
            {formatPrice(product.priceCents, product.currency) ?? "Price on the store"}
          </span>
          {product.kind === "own" ? (
            <span className="border-border-strong text-muted-foreground text-pico rounded-pill border px-[7px] py-[3px] font-mono uppercase tracking-[0.08em]">
              Their own
            </span>
          ) : null}
          {couponActive ? (
            <span className="bg-accent text-accent-foreground text-pico rounded-[6px] px-2 py-[3px] font-mono font-bold tracking-[0.08em]">
              {product.couponCode}
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}
