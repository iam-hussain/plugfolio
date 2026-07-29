import type { DiscoveryProduct } from "@plugfolio/core";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

/**
 * A product card in the explore grid (DESIGN explore.html §.thing-c): image
 * with an active-coupon chip (lime, printing the code — the Lime-Means-Offer
 * rule) OR an "own store" marker, then title, by-line, price (absent when
 * unknown, never "$0"), and Buy/Shop. The card opens the PRODUCT page — the
 * outbound tap and its attribution happen one screen later.
 */
export function ProductCard({ product }: { product: DiscoveryProduct }) {
  const price = formatPrice(product.priceCents, product.currency);
  const couponActive =
    product.couponCode && (!product.offerEndsAt || product.offerEndsAt > new Date());

  return (
    <Link
      href={`/${product.username}/product/${product.id}`}
      className="bg-card border-border shadow-rest rounded-card hover:shadow-lift flex flex-col border p-2.5 pb-3.5 no-underline transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-transparent"
    >
      <span className="bg-muted rounded-image relative block aspect-square overflow-hidden">
        {product.imageUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image src={product.imageUrl} alt="" fill unoptimized className="object-cover" />
        ) : null}
        {couponActive ? (
          <span className="bg-accent text-accent-foreground rounded-pill absolute top-2 left-2 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.04em] uppercase">
            Code {product.couponCode}
          </span>
        ) : product.kind === "own" ? (
          <span className="bg-active text-brand-violet-deep rounded-pill absolute top-2 left-2 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.04em] uppercase">
            Their own
          </span>
        ) : null}
      </span>
      <b className="mt-3 block text-[13px] leading-tight font-bold">{product.title}</b>
      <span className="text-muted-foreground mt-1 block text-[11px]">by @{product.username}</span>
      <span className="mt-auto flex items-center justify-between gap-2.5 pt-3">
        {price ? (
          <span className="text-[15px] font-semibold tabular-nums">{price}</span>
        ) : (
          <span aria-hidden />
        )}
        <span className="text-muted-foreground text-[13px] font-bold">
          {product.kind === "own" ? "Shop" : "Buy"} →
        </span>
      </span>
    </Link>
  );
}
