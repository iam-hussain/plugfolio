import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCreatorPage,
  getTraffic,
  getShopperPost,
  isFollowingProfile,
} from "@plugfolio/core";
import {
  BackLink,
  BackLinkIcon,
  BylineAvatar,
  Button,
  CreatorByline,
  DetailSectionHeading,
  EmptyState,
  MediaSlot,
  PageBand,
  PageBandText,
  PostCaption,
  ProductList,
} from "@plugfolio/ui";
import { TaggedProductCard, ViewBeacon } from "@/features/creator-page";
import { FollowButton } from "@/features/shopper-account";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Post view (brief 02, DESIGN post.html): the compact byline — whose post this
// is, not the profile — then the media, the caption, and what's tagged in it.
// Still the no-login surface (ADR-0002): every Buy here works signed out.
type Params = { handle: string; postId: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle, postId } = await params;
  const post = await getShopperPost({ creatorPages: repositories.creatorPages }, handle, postId);
  return {
    title: post?.caption ? `${post.caption} · @${handle}` : `Post · @${handle}`,
    ...(post ? { openGraph: { images: [post.mediaUrl] } } : {}),
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { handle, postId } = await params;
  const deps = { creatorPages: repositories.creatorPages };
  const [page, post] = await Promise.all([
    getCreatorPage(deps, handle),
    getShopperPost(deps, handle, postId),
  ]);
  // A hidden post (brief 07) is a 404 for visitors, same as a deleted one.
  if (!page || !post || post.hiddenAt !== null) notFound();

  const session = await auth();
  const [memberships, following] = await Promise.all([
    session?.user
      ? repositories.profiles.listAccessibleByUser(session.user.id)
      : Promise.resolve([]),
    session?.user
      ? isFollowingProfile({ follows: repositories.follows }, session.user.id, page.id)
      : Promise.resolve(false),
  ]);
  const isOwner = memberships.some((membership) => membership.id === page.id);

  // Taps are the reason tagging exists, so the owner sees this post's number
  // where they're looking at the post. Visitors never see it.
  const taps = isOwner
    ? ((await getTraffic({ traffic: repositories.traffic }, page.id)).byPost.find(
        (row) => row.postId === post.id,
      )?.taps ?? 0)
    : null;

  const productCount = post.products.length;
  // A reel is a 420px column in the middle of the measure, so its caption
  // follows that column instead of running flush left under it (ADR-0019).
  const portrait = post.mediaKind === "instagram" || post.mediaKind === "tiktok";

  return (
    <main
      data-accent={page.accent}
      className="mx-auto w-full max-w-[720px] px-5 pb-14 lg:px-11"
    >
      <ViewBeacon surface="post" postId={post.id} />
      <BackLink asChild>
        <Link href={`/${page.username}`}>
          <BackLinkIcon />
          All of @{page.username}
        </Link>
      </BackLink>
      <CreatorByline
        avatar={<BylineAvatar initial={page.username.charAt(0).toUpperCase()} src={page.avatarUrl} />}
        name={page.displayName ?? `@${page.username}`}
        handle={page.displayName ? `@${page.username}` : undefined}
        href={
          <Link href={`/${page.username}`} className="flex min-w-0 flex-1 items-center gap-3 no-underline">
            <BylineAvatar initial={page.username.charAt(0).toUpperCase()} src={page.avatarUrl} />
            <span className="flex min-w-0 flex-col">
              <b className="font-display text-label font-extrabold tracking-[-0.02em]">
                {page.displayName ?? `@${page.username}`}
              </b>
              {page.displayName ? (
                <span className="text-muted-foreground text-micro font-semibold">
                  @{page.username}
                </span>
              ) : null}
            </span>
          </Link>
        }
        action={
          isOwner ? (
            <Button variant="secondary" size="sm" asChild>
              <Link href={{ pathname: "/dashboard/posts", query: { profile: page.id } }}>
                Edit tags
              </Link>
            </Button>
          ) : (
            <FollowButton
              profileId={page.id}
              isAuthenticated={!!session?.user}
              initiallyFollowing={following}
            />
          )
        }
      />

      {taps !== null ? (
        <PageBand>
          <PageBandText
            title={`${taps} ${taps === 1 ? "tap" : "taps"} tracked from this post`}
          >
            Counted when someone opens a retailer from here.
          </PageBandText>
          <Button variant="secondary" size="sm" asChild>
            <Link href={{ pathname: "/dashboard", query: { profile: page.id } }}>
              See all Earnings
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
              The creator hasn&apos;t added the products from this one — the rest of their page still
              has everything on it.
            </EmptyState>
          </div>
        ) : (
          <ProductList>
            {post.products.map((product) => (
              <TaggedProductCard
                key={product.id}
                handle={handle}
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
