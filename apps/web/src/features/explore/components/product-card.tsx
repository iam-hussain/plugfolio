import type { DiscoveryProduct } from "@plugfolio/core";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

/**
 * Discovery product card (design-out discover, Products tab): image with the
 * lime coupon chip + "THEIR STORE" badge overlays, then title, "by @creator",
 * price and the primary pill. The card opens the product page — the outbound
 * tap (and its attribution) happens there.
 */
export function ProductCard({ product }: { product: DiscoveryProduct }) {
  const price = formatPrice(product.priceCents, product.currency);
  const couponActive =
    product.couponCode && (!product.offerEndsAt || product.offerEndsAt > new Date());

  return (
    <Link
      href={`/${product.username}/product/${product.id}`}
      className="border-border bg-background block overflow-hidden rounded-xl border"
    >
      <div className="bg-muted relative h-[130px]">
        {product.imageUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image src={product.imageUrl} alt="" fill unoptimized className="object-cover" />
        ) : null}
        {couponActive ? (
          <span className="bg-accent text-accent-foreground rounded-pill absolute left-2 top-2 inline-flex items-center gap-1 px-2 py-[3px] font-mono text-[9px] font-bold">
            <span aria-hidden className="bg-accent-foreground size-1 rounded-full" />
            {product.couponCode}
          </span>
        ) : null}
        {product.kind === "own" ? (
          <span className="bg-brand-ink/70 rounded-pill absolute right-2 top-2 px-2 py-[3px] font-mono text-[8.5px] font-bold tracking-[0.04em] text-white">
            THEIR STORE
          </span>
        ) : null}
      </div>
      <div className="px-3 py-[11px]">
        <p className="truncate text-[13px] font-semibold leading-tight">{product.title}</p>
        <p className="text-muted-foreground mt-[3px] font-mono text-[10px]">
          by @{product.username}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-[12.5px] font-bold">{price ?? ""}</span>
          <span className="bg-primary text-primary-foreground rounded-pill px-3 py-1 text-[11px] font-bold">
            {product.kind === "own" ? "Shop" : "Buy"}
          </span>
        </div>
      </div>
    </Link>
  );
}
