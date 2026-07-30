import type { ShopperProduct } from "@plugfolio/core";
import { OffPlatformNote, OwnBadge, ProductCard } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import { retailerName } from "@/lib/retailer-name";
import { CouponBlock } from "./coupon-block";
import { ProductTapButton } from "./product-tap-button";

/**
 * A tagged product on the post view (DESIGN post.html §.pcard). The card shape
 * is the design system's; this decides what the card says — which of ADR-0011's
 * three faces the product wears, and where the tap actually goes.
 *
 * The whole card is deliberately not a link: it holds two competing actions
 * (copy a code, leave for the retailer), and nesting them inside one link is
 * how a shopper copies a code by accident.
 */
export type TaggedProductCardProps = {
  handle: string;
  postId: string;
  product: ShopperProduct;
};

export function TaggedProductCard({ handle, postId, product }: TaggedProductCardProps) {
  const price = formatPrice(product.priceCents, product.currency);
  const own = product.kind === "own";
  const where = product.affiliateUrl
    ? `${own ? "their own product" : "affiliate pick"} · opens ${retailerName(product.affiliateUrl)}`
    : "in-store offer · no link to open";

  return (
    <ProductCard
      image={
        product.imageUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={240}
            height={240}
            unoptimized
            className="size-full object-cover"
          />
        ) : null
      }
      badge={own ? <OwnBadge /> : null}
      title={
        <Link
          href={`/${handle}/product/${product.id}`}
          className="hover:text-primary text-foreground no-underline hover:underline hover:underline-offset-[3px]"
        >
          {product.title}
        </Link>
      }
      price={price}
      where={where}
      coupon={
        product.couponCode ? (
          <CouponBlock
            productId={product.id}
            postId={postId}
            couponCode={product.couponCode}
            offerEndsAt={product.offerEndsAt}
            inStoreNote={product.inStoreNote}
            hasLink={!!product.affiliateUrl}
          />
        ) : null
      }
      action={
        // An in-store code has no link to open, so there is no button: the code
        // IS the action, and a Buy here would promise a shop it can't reach.
        product.affiliateUrl ? (
          <ProductTapButton
            productId={product.id}
            postId={postId}
            affiliateUrl={product.affiliateUrl}
            source="post"
            label={own ? "Shop their store" : "Buy"}
          />
        ) : null
      }
      note={
        <OffPlatformNote>
          {product.affiliateUrl
            ? `Payment settles off-platform · opens ${own ? "their store" : "the retailer"}`
            : "Payment settles off-platform · show the code in store"}
        </OffPlatformNote>
      }
    />
  );
}
