import type { ShopperProduct } from "@plugfolio/core";
import { Card, CardContent } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import { CouponBlock } from "./coupon-block";
import { ProductTapButton } from "./product-tap-button";

/**
 * A tagged product on the post view (briefs 02 + 13): "this is what's in the
 * video." Three faces of one card (ADR-0011): affiliate (Buy), the creator's
 * own product (Shop their store), and either with a coupon riding along. An
 * in-store-only coupon has no outbound button — the code IS the buy path.
 */
export type TaggedProductCardProps = {
  handle: string;
  postId: string;
  product: ShopperProduct;
};

export function TaggedProductCard({ handle, postId, product }: TaggedProductCardProps) {
  const price = formatPrice(product.priceCents, product.currency);

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/${handle}/product/${product.id}`}
            className="bg-muted relative block h-16 w-16 shrink-0 overflow-hidden rounded-sm"
          >
            {product.imageUrl ? (
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
            <Link href={`/${handle}/product/${product.id}`} className="block truncate font-medium">
              {product.title}
            </Link>
            {price ? <p className="text-muted-foreground text-sm">{price}</p> : null}
            {product.kind === "own" ? (
              <p className="text-muted-foreground text-xs">Their own product</p>
            ) : null}
          </div>
          {product.affiliateUrl ? (
            <ProductTapButton
              productId={product.id}
              postId={postId}
              affiliateUrl={product.affiliateUrl}
              source="post"
              label={product.kind === "own" ? "Shop their store" : "Buy"}
            />
          ) : null}
        </div>
        {product.couponCode ? (
          <CouponBlock
            productId={product.id}
            postId={postId}
            couponCode={product.couponCode}
            offerEndsAt={product.offerEndsAt}
            inStoreNote={product.inStoreNote}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
