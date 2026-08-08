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
  ProductDetail,
} from "@plugfolio/ui";
import type { Route } from "next";
import Link from "next/link";
import { PillNavOverride, pillNavActionQuiet, pillNavCircle } from "@/components/chrome/pill-nav";
import { CommentsSection, WatchButton } from "@/features/shopper-account";
import { JsonLd } from "@/components/json-ld";
import { formatPrice } from "@/lib/format-price";
import { retailerName } from "@/lib/retailer-name";
import { CreatorContextBar } from "./creator-context-bar";
import { ProductDetailInfo, ProductDetailMedia, ProductTrafficBand } from "./product-page-sections";
import { ProductTapButton } from "./product-tap-button";
import { ViewBeacon } from "./view-beacon";

/**
 * The product page (brief 03 + 13, DESIGN product.html) — one thing, in detail,
 * with a way back.
 *
 * The route above it loads and nothing else (§5: `app/` is thin). The buy path
 * stays account-free (ADR-0002, §2.2); a session only enriches. The detail
 * columns, the coupon block and the traffic band live in
 * `product-page-sections.tsx`.
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
      {/* The pill nav morphs into the buy verbs (ADR-0026 §6). An in-store
          offer has no link, so the pill says so instead of promising a shop
          it cannot reach. */}
      <PillNavOverride>
        <Link
          href={`/${page.username}`}
          aria-label={`Back to @${page.username}`}
          className={pillNavCircle}
        >
          <span aria-hidden>←</span>
        </Link>
        <WatchButton
          kind="product"
          targetId={product.id}
          isAuthenticated={viewer.signedIn}
          initiallyWatched={viewer.watched}
          display="icon"
        />
        {inStoreOnly ? (
          <span className={pillNavActionQuiet}>In-store only</span>
        ) : (
          <ProductTapButton
            productId={product.id}
            postId={product.fromPost?.id}
            affiliateUrl={product.affiliateUrl!}
            source="product"
            label={own ? "Shop their store" : `Buy at ${retailerName(product.affiliateUrl!)}`}
            className="h-10 px-5"
          />
        )}
      </PillNavOverride>
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

      {traffic ? <ProductTrafficBand page={page} traffic={traffic} /> : null}

      <ProductDetail>
        <ProductDetailMedia product={product} />
        <ProductDetailInfo
          page={page}
          product={product}
          own={own}
          inStoreOnly={inStoreOnly}
          price={price}
        />
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
