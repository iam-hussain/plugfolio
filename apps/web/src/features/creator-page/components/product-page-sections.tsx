import type { CreatorPage, ProductTraffic, ShopperProduct } from "@plugfolio/core";
import {
  Button,
  OffPlatformNote,
  OwnBadge,
  PageBand,
  PageBandText,
  ProductBuy,
  ProductInStoreNote,
  ProductMedia,
  ProductPrice,
  ProductSource,
  ProductTitle,
  ProductWhere,
} from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { retailerName } from "@/lib/retailer-name";
import { CouponBlock } from "./coupon-block";
import { ProductTapButton } from "./product-tap-button";

/**
 * The section pieces of the product page (brief 03 + 13, DESIGN product.html),
 * split out of `ProductPageView` so that surface is composition: the owner's
 * traffic band, the media column, the title/price/buy column, and the
 * "from this post" band. Server Components — only the tap button and coupon
 * copy are client islands underneath.
 */
type DetailProduct = ShopperProduct & {
  profileId: string;
  fromPost: { id: string; mediaUrl: string } | null;
};

/** The owner sees this product's numbers where they're looking at the product
 * (DESIGN product.html §.band-v). Visitors never do. Copies are counted;
 * whether a code was redeemed at a counter is not, and the band says so rather
 * than letting the number imply a sale (§2.3). */
export function ProductTrafficBand({
  page,
  traffic,
}: {
  page: CreatorPage;
  traffic: ProductTraffic;
}) {
  return (
    <PageBand>
      <PageBandText
        title={`${traffic.taps} ${traffic.taps === 1 ? "tap" : "taps"} tracked · ${traffic.codeCopies} code ${traffic.codeCopies === 1 ? "copy" : "copies"}`}
      >
        Copies are counted; whether a code was redeemed in a shop is not.
      </PageBandText>
      <Button variant="action" asChild>
        <Link href={{ pathname: "/dashboard", query: { profile: page.id } }}>See all traffic</Link>
      </Button>
    </PageBand>
  );
}

export function ProductDetailMedia({ product }: { product: DetailProduct }) {
  return (
    <ProductMedia>
      {product.imageUrl ? (
        /* ponytail: unoptimized until the social-import pipeline pins image domains */
        <Image
          src={product.imageUrl}
          alt={product.title}
          width={900}
          height={900}
          unoptimized
          priority
          className="block aspect-square w-full object-cover"
        />
      ) : null}
    </ProductMedia>
  );
}

export function ProductDetailInfo({
  page,
  product,
  own,
  inStoreOnly,
  price,
}: {
  page: CreatorPage;
  product: DetailProduct;
  own: boolean;
  inStoreOnly: boolean;
  price: string | null;
}) {
  return (
    <div>
      {own ? <OwnBadge>Their own product</OwnBadge> : null}
      <ProductTitle>{product.title}</ProductTitle>
      <ProductPrice>{price}</ProductPrice>
      <ProductWhere>
        {inStoreOnly ? (
          <>
            <b>In-store offer</b> · no link, use the code
          </>
        ) : (
          <>
            <b>{own ? "Their own product" : "Affiliate pick"}</b> · opens{" "}
            {retailerName(product.affiliateUrl!)}
          </>
        )}
      </ProductWhere>

      {/* Copy, then go — the coupon is always above the action (ADR-0011). */}
      {product.couponCode ? (
        <CouponBlock
          productId={product.id}
          postId={product.fromPost?.id}
          couponCode={product.couponCode}
          offerEndsAt={product.offerEndsAt}
          inStoreNote={product.inStoreNote}
          hasLink={!!product.affiliateUrl}
        />
      ) : null}

      {inStoreOnly ? (
        <ProductInStoreNote>
          {product.inStoreNote ??
            "Show the code at the counter. We can't track in-store redemption, so this one is on trust."}
        </ProductInStoreNote>
      ) : (
        <ProductBuy>
          <ProductTapButton
            productId={product.id}
            postId={product.fromPost?.id}
            affiliateUrl={product.affiliateUrl!}
            source="product"
            label={own ? "Shop their store" : "Buy"}
          />
        </ProductBuy>
      )}

      <OffPlatformNote>
        {inStoreOnly
          ? "Payment settles off-platform · show the code in store"
          : `Payment settles off-platform · opens ${own ? "their store" : "the retailer"}`}
      </OffPlatformNote>

      {product.fromPost ? <ProductFromPost page={page} product={product} /> : null}
    </div>
  );
}

/** The "from this post" band — a thumb that opens the post the product was
 * tagged in. */
function ProductFromPost({ page, product }: { page: CreatorPage; product: DetailProduct }) {
  if (!product.fromPost) return null;
  return (
    <ProductSource
      asChild
      title="Open the post"
      thumb={
        /* ponytail: unoptimized until the social-import pipeline pins image domains */
        <Image
          src={product.fromPost.mediaUrl}
          alt=""
          width={116}
          height={116}
          unoptimized
          className="size-full object-cover"
        />
      }
    >
      <Link href={`/${page.username}/post/${product.fromPost.id}`} />
    </ProductSource>
  );
}
