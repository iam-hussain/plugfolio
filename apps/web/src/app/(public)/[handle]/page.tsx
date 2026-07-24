import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  getComments,
  getCreatorPage,
  getMemberHandle,
  getProfileLinks,
  isFollowingProfile,
} from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import { CategoryChips, CreatorHeader, PostGrid, ShareButton } from "@/features/creator-page";
import { RequestCollabForm } from "@/features/business-collab";
import { CommentClaim, CommentForm, CommentList, FollowButton } from "@/features/shopper-account";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The no-login shopper surface (ADR-0002). Server Component for fast, indexable
// pages that behave inside in-app browsers (§5, ADR-0001). RSC calls the read
// services directly — no HTTP hop (§6.11). A session, if present, only enriches
// (follow state, comment box) — nothing here ever requires one (§2.2).
type Params = { handle: string };
type SearchParams = { category?: string };

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

  // ProfilePage JSON-LD — tells search/answer engines this is a creator's
  // shoppable page (AEO); only public facts, nothing session-derived.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: `@${page.username}`,
      identifier: page.username,
      url: `${SITE_URL}/${page.username}`,
    },
  };

  const session = await auth();
  const [following, comments, business, ownHandle, memberships, links] = await Promise.all([
    session?.user
      ? isFollowingProfile({ follows: repositories.follows }, session.user.id, page.id)
      : Promise.resolve(false),
    getComments({ comments: repositories.comments }, page.id),
    session?.user
      ? repositories.businesses.findByUser(session.user.id)
      : Promise.resolve(null),
    session?.user
      ? getMemberHandle({ users: repositories.users }, session.user.id)
      : Promise.resolve(""),
    session?.user
      ? repositories.profiles.listAccessibleByUser(session.user.id)
      : Promise.resolve([]),
    getProfileLinks({ profileLinks: repositories.profileLinks }, page.id),
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

  // Category chips filter the grid (ADR-0010); "All" holds everything.
  const { category } = await searchParams;
  const activeCategory = page.categories.find((c) => c.id === category) ?? null;
  const posts = activeCategory
    ? page.posts.filter((post) => post.categoryId === activeCategory.id)
    : page.posts;

  // One page, four viewers (design-out): the owner (Admin or Manager) gets
  // owner tools where visitors get Follow — the buy path never changes.
  const ownMembership = memberships.find((membership) => membership.id === page.id) ?? null;

  // ADR-0009 default: on your own page you speak as the profile; the picker
  // lets a member choose otherwise, per comment.
  const identities = memberships.map(({ id, username }) => ({ id, username }));
  const defaultAsProfileId = identities.some((identity) => identity.id === page.id)
    ? page.id
    : null;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-14 lg:px-11">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CreatorHeader
        handle={page.username}
        followerCount={page.followerCount}
        socials={socials}
        action={
          ownMembership ? (
            <div className="flex items-center gap-2">
              <ShareButton path={`/${page.username}`} />
              {ownMembership.role === "admin" ? (
                <Button variant="outline" size="sm" className="rounded-pill px-5" asChild>
                  <Link href={{ pathname: "/dashboard/settings", query: { profile: page.id } }}>
                    Edit profile
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <FollowButton
              profileId={page.id}
              isAuthenticated={!!session?.user}
              initiallyFollowing={following}
            />
          )
        }
      />
      {ownMembership ? (
        <div className="border-border bg-muted mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[14px] border px-4 py-3.5">
          <p className="text-sm">
            <span className="text-primary font-mono text-[10px] tracking-[0.08em] uppercase">
              This is your page
            </span>
            <span className="text-muted-foreground block">
              Visitors see exactly this{ownMembership.role === "admin" && socials.length === 0
                ? " — add your links in Settings to show your socials"
                : ""}
              .
            </span>
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={{ pathname: "/dashboard", query: { profile: page.id } }}>Dashboard</Link>
          </Button>
        </div>
      ) : null}
      {business && !ownMembership ? (
        <div className="border-border bg-muted mt-4 rounded-[14px] border px-4 py-3.5">
          <p className="text-primary mb-2 font-mono text-[10px] uppercase tracking-[0.08em]">
            You own a business
          </p>
          <RequestCollabForm profileId={page.id} />
        </div>
      ) : null}
      <CategoryChips
        handle={page.username}
        categories={page.categories}
        activeId={activeCategory?.id ?? null}
      />
      {activeCategory && posts.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Nothing here yet —{" "}
          <Link href={`/${page.username}`} className="underline">
            see All
          </Link>
          .
        </p>
      ) : (
        <PostGrid handle={page.username} posts={posts} />
      )}
      <section aria-label="Comments" className="mt-[34px]">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="font-display text-lg font-bold">Comments</h2>
          <span className="text-muted-foreground font-mono text-[11px]">{comments.length}</span>
        </div>
        <CommentList
          comments={comments}
          replyContext={
            session?.user ? { profileId: page.id, ownHandle, identities, defaultAsProfileId } : null
          }
        />
        <div className="pt-4">
          {session?.user ? (
            <CommentForm
              profileId={page.id}
              ownHandle={ownHandle}
              identities={identities}
              defaultAsProfileId={defaultAsProfileId}
            />
          ) : (
            <CommentClaim />
          )}
        </div>
      </section>
    </main>
  );
}
