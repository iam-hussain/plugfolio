import type { ShopperProduct } from "@plugfolio/core";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import { retailerName } from "@/lib/retailer-name";
import { CouponBlock } from "./coupon-block";
import { ProductTapButton } from "./product-tap-button";

/**
 * A tagged product on the post view (design-out post detail): 56px thumb,
 * title, mono "price · opens retailer" meta with the quiet THEIR OWN PRODUCT
 * tag, the pill action, and the code chip riding below (ADR-0011's three
 * faces). An in-store-only coupon has no outbound button — the code IS the
 * buy path.
 */
export type TaggedProductCardProps = {
  handle: string;
  postId: string;
  product: ShopperProduct;
};

export function TaggedProductCard({ handle, postId, product }: TaggedProductCardProps) {
  const price = formatPrice(product.priceCents, product.currency);
  const meta = [price, product.affiliateUrl ? `opens ${retailerName(product.affiliateUrl)}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="border-border bg-background rounded-xl border p-3">
      <div className="flex items-center gap-[13px]">
        <Link
          href={`/${handle}/product/${product.id}`}
          className="bg-muted relative block size-14 shrink-0 overflow-hidden rounded-[10px]"
        >
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
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/${handle}/product/${product.id}`}
            className="block truncate text-sm font-semibold"
          >
            {product.title}
          </Link>
          <div className="mt-[3px] flex flex-wrap items-center gap-[7px]">
            {meta ? <span className="text-muted-foreground font-mono text-[11px]">{meta}</span> : null}
            {product.kind === "own" ? (
              <span className="text-muted-foreground border-border rounded-pill border px-[7px] py-px font-mono text-[8.5px] font-bold tracking-[0.04em]">
                THEIR OWN PRODUCT
              </span>
            ) : null}
          </div>
        </div>
        {product.affiliateUrl ? (
          <ProductTapButton
            productId={product.id}
            postId={postId}
            affiliateUrl={product.affiliateUrl}
            source="post"
            label={product.kind === "own" ? "Shop their store" : "Buy"}
            className="whitespace-nowrap"
          />
        ) : null}
      </div>
      {product.couponCode ? (
        <div className="mt-2.5">
          <CouponBlock
            productId={product.id}
            postId={postId}
            couponCode={product.couponCode}
            offerEndsAt={product.offerEndsAt}
            inStoreNote={product.inStoreNote}
            hasLink={!!product.affiliateUrl}
            variant="chip"
          />
        </div>
      ) : null}
    </div>
  );
}
