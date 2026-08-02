import type {
  CommentPage,
  CommentSort,
  CreatorPage,
  ProductTraffic,
  ShopperProduct,
} from "@plugfolio/core";
import {
  BackLink,
  BackLinkIcon,
  Button,
  BylineAvatar,
  cn,
  CreatorByline,
  measure,
  OffPlatformNote,
  OwnBadge,
  PageBand,
  PageBandText,
  ProductBuy,
  ProductDetail,
  ProductInStoreNote,
  ProductMedia,
  ProductPrice,
  ProductSource,
  ProductTitle,
  ProductWhere,
} from "@plugfolio/ui";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { CommentsSection, WatchButton } from "@/features/shopper-account";
import { JsonLd } from "@/components/json-ld";
import { formatPrice } from "@/lib/format-price";
import { retailerName } from "@/lib/retailer-name";
import { CouponBlock } from "./coupon-block";
import { CreatorContextBar } from "./creator-context-bar";
import { ProductTapButton } from "./product-tap-button";
import { ViewBeacon } from "./view-beacon";

/**
 * The product page (brief 03 + 13, DESIGN product.html) — one thing, in detail,
 * with a way back.
 *
 * The route above it loads and nothing else (§5: `app/` is thin). The buy path
 * stays account-free (ADR-0002, §2.2); a session only enriches.
 */
export type ProductPageViewProps = {
  page: CreatorPage;
  product: ShopperProduct & {
    profileId: string;
    fromPost: { id: string; mediaUrl: string } | null;
  };
  /** The owner's numbers for this product; null for everyone else. */
  traffic: ProductTraffic | null;
  isOwner: boolean;
  comments: {
    page: CommentPage;
    sort: CommentSort;
    pageNumber: number;
    enabled: boolean;
  };
  viewer: {
    signedIn: boolean;
    /** Whether this product is already on the viewer's watchlist. */
    watched: boolean;
    ownHandle: string;
    identities: readonly { id: string; username: string }[];
  };
  /** Product + breadcrumb JSON-LD, built by the route from public facts. */
  structuredData: readonly Record<string, unknown>[];
};

export function ProductPageView({
  page,
  product,
  traffic,
  isOwner,
  comments,
  viewer,
  structuredData,
}: ProductPageViewProps) {
  const price = formatPrice(product.priceCents, product.currency);
  const own = product.kind === "own";
  // No link means no button (ADR-0011): the code IS the action, and a Buy here
  // would promise a shop it can't reach.
  const inStoreOnly = product.affiliateUrl === null;
  const defaultAsProfileId = viewer.identities.some((i) => i.id === product.profileId)
    ? product.profileId
    : null;

  return (
    <main data-accent={page.accent} className={cn(measure(), "pb-[clamp(48px,7vw,84px)]")}>
      {structuredData.map((data, index) => (
        <JsonLd key={index} data={data} />
      ))}
      <ViewBeacon surface="product" productId={product.id} />
      {/* Scroll past the byline and the shared top bar becomes the creator's;
          tapping it goes back to their page. Their byline sits high, so it
          hands over sooner than on the creator page's tall cover. */}
      <CreatorContextBar
        handle={page.username}
        displayName={page.displayName}
        avatarUrl={page.avatarUrl}
        href={`/${page.username}` as Route}
        revealAfter={120}
      />
      <BackLink asChild>
        <Link href={`/${page.username}`}>
          <BackLinkIcon />
          All of @{page.username}
        </Link>
      </BackLink>
      <CreatorByline
        avatar={
          <BylineAvatar initial={page.username.charAt(0).toUpperCase()} src={page.avatarUrl} />
        }
        name={page.displayName ?? `@${page.username}`}
        handle={page.displayName ? `@${page.username}` : undefined}
        action={
          isOwner ? (
            <Button variant="action" asChild>
              <Link
                href={{
                  pathname: `/dashboard/products/${product.id}`,
                  query: { profile: page.id },
                }}
              >
                Edit product
              </Link>
            </Button>
          ) : (
            <WatchButton
              kind="product"
              targetId={product.id}
              isAuthenticated={viewer.signedIn}
              initiallyWatched={viewer.watched}
            />
          )
        }
      />

      {/* The owner sees this product's numbers where they're looking at the
          product (DESIGN product.html §.band-v). Visitors never do. Copies are
          counted; whether a code was redeemed at a counter is not, and the band
          says so rather than letting the number imply a sale (§2.3). */}
      {traffic ? (
        <PageBand>
          <PageBandText
            title={`${traffic.taps} ${traffic.taps === 1 ? "tap" : "taps"} tracked · ${traffic.codeCopies} code ${traffic.codeCopies === 1 ? "copy" : "copies"}`}
          >
            Copies are counted; whether a code was redeemed in a shop is not.
          </PageBandText>
          <Button variant="action" asChild>
            <Link href={{ pathname: "/dashboard", query: { profile: page.id } }}>
              See all traffic
            </Link>
          </Button>
        </PageBand>
      ) : null}

      <ProductDetail>
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

          {product.fromPost ? (
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
          ) : null}
        </div>
      </ProductDetail>

      <CommentsSection
        profileId={product.profileId}
        productId={product.id}
        report={{ targetType: "product", targetId: product.id, targetLabel: "this product" }}
        comments={comments.page}
        sort={comments.sort}
        page={comments.pageNumber}
        enabled={comments.enabled}
        viewer={{
          signedIn: viewer.signedIn,
          ownHandle: viewer.ownHandle,
          identities: viewer.identities,
          defaultAsProfileId,
        }}
        basePath={`/${page.username}/product/${product.id}`}
      />
    </main>
  );
}
