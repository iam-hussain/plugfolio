import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  commentSort,
  getComments,
  getCreatorPage,
  getMemberHandle,
  getProfileLinks,
  isFeatureEnabled,
  isFollowingProfile,
  listProfileProducts,
} from "@plugfolio/core";
import { CreatorPageView } from "@/features/creator-page";
import { breadcrumbList } from "@/lib/structured-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The no-login shopper surface (ADR-0002). Server Component for fast, indexable
// pages that behave inside in-app browsers (§5, ADR-0001). RSC calls the read
// services directly — no HTTP hop (§6.11). A session, if present, only enriches
// (follow state, comment box) — nothing here ever requires one (§2.2).
type Params = { handle: string };
type SearchParams = { category?: string; sort?: string; cpage?: string };

// One fetch per request, shared by generateMetadata and the page.
const loadCreatorPage = cache((handle: string) =>
  getCreatorPage({ creatorPages: repositories.creatorPages }, handle),
);

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle } = await params;
  const page = await loadCreatorPage(handle);
  if (!page) return { title: `@${handle}` };
  const description = `Shop @${page.username}'s posts on ${SITE_NAME} — every tagged product, straight from the retailer. No account needed.`;
  const firstMedia = page.posts[0]?.mediaUrl;
  return {
    title: `@${page.username}`,
    description,
    alternates: { canonical: `/${page.username}` },
    openGraph: {
      type: "profile",
      url: `/${page.username}`,
      title: `@${page.username} · ${SITE_NAME}`,
      description,
      // The creator's latest post is the truest share card; the brand og:image
      // is the fallback when they haven't posted yet.
      ...(firstMedia ? { images: [firstMedia] } : {}),
    },
  };
}

export default async function CreatorPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { handle } = await params;
  const page = await loadCreatorPage(handle);
  if (!page) notFound();

  const { category, sort, cpage } = await searchParams;
  const activeSort = commentSort.catch("recent").parse(sort);
  const commentPage = Math.max(1, Number(cpage) || 1);
  const session = await auth();
  const commentsEnabled = await isFeatureEnabled(
    { settings: repositories.settings },
    "comments",
    true,
  );
  const [following, comments, business, ownHandle, memberships, links, allProducts] =
    await Promise.all([
      session?.user
        ? isFollowingProfile({ follows: repositories.follows }, session.user.id, page.id)
        : Promise.resolve(false),
      getComments({ comments: repositories.comments }, page.id, {
        sort: activeSort,
        page: commentPage,
        viewerId: session?.user?.id ?? null,
      }),
      session?.user ? repositories.businesses.findByUser(session.user.id) : Promise.resolve(null),
      session?.user
        ? getMemberHandle({ users: repositories.users }, session.user.id)
        : Promise.resolve(""),
      session?.user
        ? repositories.profiles.listAccessibleByUser(session.user.id)
        : Promise.resolve([]),
      getProfileLinks({ profileLinks: repositories.profileLinks }, page.id),
      listProfileProducts({ creatorPages: repositories.creatorPages }, page.username),
    ]);

  // "Your links" → the socials row (design-out: required on every creator
  // header). Label = the platform; the website reads as its hostname.
  const socials = links.map((link) => ({
    platform: link.platform,
    href: link.url,
    label:
      link.platform === "website"
        ? new URL(link.url).hostname.replace(/^www\./, "")
        : link.platform.charAt(0).toUpperCase() + link.platform.slice(1),
  }));

  // ProfilePage + breadcrumb JSON-LD (SEO/AEO) — public facts only, nothing
  // session-derived. `sameAs` ties this page to the creator's other platforms,
  // which is how entity/answer engines connect them to one person.
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/${page.username}`,
        mainEntity: {
          "@type": "Person",
          name: page.displayName ?? `@${page.username}`,
          alternateName: `@${page.username}`,
          identifier: page.username,
          url: `${SITE_URL}/${page.username}`,
          ...(page.bio ? { description: page.bio } : {}),
          ...(page.avatarUrl?.startsWith("http") ? { image: page.avatarUrl } : {}),
          ...(socials.length > 0 ? { sameAs: socials.map((social) => social.href) } : {}),
        },
      },
      breadcrumbList([
        { name: SITE_NAME, path: "/" },
        { name: `@${page.username}`, path: `/${page.username}` },
      ]),
    ],
  };

  return (
    <CreatorPageView
      page={page}
      allProducts={allProducts}
      links={links}
      category={category}
      comments={{
        page: comments,
        sort: activeSort,
        pageNumber: commentPage,
        enabled: commentsEnabled,
      }}
      viewer={{
        signedIn: !!session?.user,
        following,
        ownHandle,
        identities: memberships.map(({ id, username }) => ({ id, username })),
        membership: memberships.find((membership) => membership.id === page.id) ?? null,
        hasBusiness: !!business,
      }}
      structuredData={structuredData}
    />
  );
}
