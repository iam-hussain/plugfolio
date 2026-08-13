import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCreatorPage,
  getTraffic,
  getShopperPost,
  isFollowingProfile,
  isWatched,
} from "@plugfolio/core";
import { PostPageView } from "@/features/creator-page";
import { breadcrumbList, socialMediaPosting } from "@/lib/structured-data";
import { SITE_NAME } from "@/lib/site";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Post view (brief 02, DESIGN post.html): the compact byline — whose post this
// is, not the profile — then the media, the caption, and what's tagged in it.
// Still the no-login surface (ADR-0002): every Buy here works signed out.
type Params = { handle: string; postId: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle, postId } = await params;
  const post = await getShopperPost({ creatorPages: repositories.creatorPages }, handle, postId);
  if (!post) return { title: `Post · @${handle}` };

  const count = post.products.length;
  const title = post.caption ? `${post.caption} · @${handle}` : `Post · @${handle}`;
  const tagged =
    count > 0 ? `${count} product${count === 1 ? "" : "s"} tagged` : "A shoppable post";
  const description = `${post.caption ? `${post.caption} — ` : ""}${tagged} by @${handle} on ${SITE_NAME}. Tap any tag to buy it straight at the retailer — no account needed.`;
  const path = `/${handle}/post/${postId}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    // The share image is the generated media-led card (./opengraph-image.tsx).
    openGraph: { type: "article", url: path, title, description },
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
  const [memberships, following, watched] = await Promise.all([
    session?.user
      ? repositories.profiles.listAccessibleByUser(session.user.id)
      : Promise.resolve([]),
    session?.user
      ? isFollowingProfile({ follows: repositories.follows }, session.user.id, page.id)
      : Promise.resolve(false),
    session?.user
      ? isWatched({ watchlist: repositories.watchlist }, session.user.id, "post", post.id)
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

  // SocialMediaPosting + breadcrumbs (SEO/AEO) — the media, the caption, the
  // author, and each tagged product as a mention; public facts only.
  const postPath = `/${page.username}/post/${post.id}`;
  const postLd = socialMediaPosting({
    caption: post.caption,
    mediaUrl: post.mediaUrl,
    creatorUsername: page.username,
    path: postPath,
    products: post.products.map((item) => ({
      title: item.title,
      path: `/${page.username}/product/${item.id}`,
    })),
  });
  const crumbs = breadcrumbList([
    { name: SITE_NAME, path: "/" },
    { name: `@${page.username}`, path: `/${page.username}` },
    { name: post.caption ?? "Post", path: postPath },
  ]);

  return (
    <PostPageView
      page={page}
      post={post}
      isOwner={isOwner}
      taps={taps}
      viewer={{ signedIn: !!session?.user, following, watched }}
      structuredData={[postLd, crumbs]}
    />
  );
}
