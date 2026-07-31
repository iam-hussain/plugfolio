import type { CreatorPage, ShopperPost } from "@plugfolio/core";
import {
  BackLink,
  BackLinkIcon,
  Button,
  BylineAvatar,
  cn,
  CreatorByline,
  DetailSectionHeading,
  EmptyState,
  measure,
  MediaSlot,
  PageBand,
  PageBandText,
  PostCaption,
  ProductList,
} from "@plugfolio/ui";
import Link from "next/link";
import { FollowButton } from "@/features/shopper-account";
import { JsonLd } from "@/components/json-ld";
import { ShareButton } from "./share-button";
import { TaggedProductCard } from "./tagged-product-card";
import { ViewBeacon } from "./view-beacon";

/**
 * The post view (brief 02, DESIGN post.html) — the compact byline (whose post
 * this is, not the profile), then the media, the caption, and what's tagged.
 *
 * The route above it loads and nothing else (§5: `app/` is thin). Still the
 * no-login surface (ADR-0002): every Buy here works signed out.
 */
export type PostPageViewProps = {
  page: CreatorPage;
  post: ShopperPost;
  isOwner: boolean;
  /** The owner's tap count for this post; null for everyone else. */
  taps: number | null;
  viewer: { signedIn: boolean; following: boolean };
  /** Breadcrumb JSON-LD, built by the route from public facts. */
  structuredData: Record<string, unknown>;
};

export function PostPageView({
  page,
  post,
  isOwner,
  taps,
  viewer,
  structuredData,
}: PostPageViewProps) {
  const productCount = post.products.length;
  // A reel is a 420px column in the middle of the measure, so its caption
  // follows that column instead of running flush left under it (ADR-0019).
  const portrait = post.mediaKind === "instagram" || post.mediaKind === "tiktok";

  return (
    <main data-accent={page.accent} className={cn(measure(), "pb-[clamp(48px,7vw,84px)]")}>
      <JsonLd data={structuredData} />
      <ViewBeacon surface="post" postId={post.id} />
      <BackLink asChild>
        <Link href={`/${page.username}`}>
          <BackLinkIcon />
          All of @{page.username}
        </Link>
      </BackLink>
      <CreatorByline
        asChild
        avatar={
          <BylineAvatar initial={page.username.charAt(0).toUpperCase()} src={page.avatarUrl} />
        }
        name={page.displayName ?? `@${page.username}`}
        handle={page.displayName ? `@${page.username}` : undefined}
        action={
          isOwner ? (
            <>
              <ShareButton
                handle={page.username}
                displayName={page.displayName}
                avatarUrl={page.avatarUrl}
                meta={`${productCount} ${productCount === 1 ? "product" : "products"} tagged`}
                path={`/${page.username}/post/${post.id}`}
              />
              <Button variant="action" asChild>
                <Link href={{ pathname: "/dashboard/posts", query: { profile: page.id } }}>
                  Edit tags
                </Link>
              </Button>
            </>
          ) : (
            <FollowButton
              profileId={page.id}
              isAuthenticated={viewer.signedIn}
              initiallyFollowing={viewer.following}
            />
          )
        }
      >
        <Link href={`/${page.username}`} />
      </CreatorByline>

      {/* Taps are the reason tagging exists, so the owner sees this post's
          number where they're looking at the post. Visitors never see it. */}
      {taps !== null ? (
        <PageBand>
          <PageBandText title={`${taps} ${taps === 1 ? "tap" : "taps"} tracked from this post`}>
            Counted when someone opens a retailer from here. Editing lives in the header.
          </PageBandText>
          {/* "Earnings" was the old name for a screen that earns nothing —
              it counts views, taps and code copies (§6.6). */}
          <Button variant="action" asChild>
            <Link href={{ pathname: "/dashboard", query: { profile: page.id } }}>
              See all traffic
            </Link>
          </Button>
        </PageBand>
      ) : null}

      <figure className="m-0 mt-4">
        <MediaSlot
          kind={post.mediaKind}
          poster={post.mediaUrl}
          alt={post.caption ?? `Post by @${page.username}`}
          embedUrl={post.embedUrl}
          sourceUrl={post.sourceUrl}
        />
        {post.caption ? (
          <figcaption>
            <PostCaption portrait={portrait}>{post.caption}</PostCaption>
          </figcaption>
        ) : null}
      </figure>

      <DetailSectionHeading
        title="In this post"
        meta={`${productCount} ${productCount === 1 ? "product" : "products"} tagged`}
      />
      <section aria-label="Tagged products">
        {productCount === 0 ? (
          <div className="mt-5">
            <EmptyState title="Nothing tagged on this post yet">
              The creator hasn&apos;t added the products from this one — the rest of their page
              still has everything on it.
            </EmptyState>
          </div>
        ) : (
          <ProductList>
            {post.products.map((product) => (
              <TaggedProductCard
                key={product.id}
                handle={page.username}
                postId={post.id}
                product={product}
              />
            ))}
          </ProductList>
        )}
      </section>
    </main>
  );
}
