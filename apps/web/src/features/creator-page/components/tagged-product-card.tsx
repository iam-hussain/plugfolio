import type { ShopperProduct } from "@plugfolio/core";
import { Card, CardContent } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import { ProductTapButton } from "./product-tap-button";

/**
 * A tagged product on the post view (brief 02): "this is what's in the video."
 * Title/image link to the product page; Buy taps straight out (no extra step
 * on the buy path — §2.2).
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
      <CardContent className="flex items-center gap-3 p-3">
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
        </div>
        <ProductTapButton
          productId={product.id}
          postId={postId}
          affiliateUrl={product.affiliateUrl}
          source="post"
        />
      </CardContent>
    </Card>
  );
}
