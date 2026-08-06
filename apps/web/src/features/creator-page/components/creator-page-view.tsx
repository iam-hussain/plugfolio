import type {
  CommentPage,
  CommentSort,
  CreatorPage,
  CreatorProductRow,
  ProfileLinkView,
} from "@plugfolio/core";
import { Button, CreatorHeader, EmptyState, measure, SocialsRow } from "@plugfolio/ui";
import Link from "next/link";
import { CommentsSection, FollowButton } from "@/features/shopper-account";
import { formatCount } from "@/lib/format-count";
import { buildCreatorPageModel } from "../creator-page-model";
import { CategoryChips } from "./category-chips";
import { CreatorContextBar } from "./creator-context-bar";
import { AnonBand, BusinessBand, CreatorPageCover, CreatorPageNav } from "./creator-page-sections";
import { OwnerBand } from "./owner-band";
import { PageShare } from "./page-share";
import { PostGrid } from "./post-grid";
import { ViewBeacon } from "./view-beacon";

/**
 * The creator page itself (DESIGN creator.html) — cover, header, shelves, the
 * wall, the thread.
 *
 * The route above it loads and nothing else (§5: `app/` is thin). This used to
 * be 200 lines of JSX inside `app/(public)/[handle]/page.tsx`, which meant the
 * one surface the whole product hangs off had no home in `features/` and no way
 * to be rendered in Storybook.
 *
 * Server Component: the no-login shopper surface renders on the server
 * (ADR-0002) and only the follow button, the share sheet, the customise drawer
 * and the comment composer are client islands. The derivations live in
 * `creator-page-model.ts`; the section pieces in `creator-page-sections.tsx`.
 */
export type CreatorPageViewProps = {
  page: CreatorPage;
  /** Every product on the profile — standalone ones are picked out here. */
  allProducts: readonly CreatorProductRow[];
  links: readonly ProfileLinkView[];
  /** The shelf currently filtered to, straight off the URL. */
  category?: string;
  comments: {
    page: CommentPage;
    sort: CommentSort;
    /** 1-based. */
    pageNumber: number;
    enabled: boolean;
  };
  viewer: {
    signedIn: boolean;
    following: boolean;
    /** The viewer's @member-handle (ADR-0009); empty when signed out. */
    ownHandle: string;
    /** Profiles this viewer can act as — empty for a visitor. */
    identities: readonly { id: string; username: string }[];
    /** The viewer's own membership of *this* profile, when they have one. */
    membership: { id: string; role: string } | null;
    /** Set when the viewer owns a business, which unlocks the collab band. */
    hasBusiness: boolean;
  };
  /** ProfilePage + breadcrumb JSON-LD, built by the route from public facts. */
  structuredData: unknown;
};

export function CreatorPageView({
  page,
  allProducts,
  links,
  category,
  comments,
  viewer,
  structuredData,
}: CreatorPageViewProps) {
  const {
    socials,
    posts,
    products,
    activeCategory,
    shopCount,
    thingsCount,
    defaultAsProfileId,
    cover,
  } = buildCreatorPageModel({
    page,
    allProducts,
    links,
    category,
    identities: viewer.identities,
  });

  const { membership } = viewer;

  const follow = (
    <FollowButton
      profileId={page.id}
      isAuthenticated={viewer.signedIn}
      initiallyFollowing={viewer.following}
    />
  );

  return (
    <main data-accent={page.accent} className="pb-14">
      <ViewBeacon surface="profile" username={page.username} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Past the header, the shared top bar becomes this creator's. */}
      <CreatorContextBar
        handle={page.username}
        displayName={page.displayName}
        avatarUrl={page.avatarUrl}
        action={membership ? null : follow}
      />
      <CreatorPageNav
        page={page}
        membership={membership}
        follow={follow}
        postsCount={posts.length}
        thingsCount={thingsCount}
      />
      <CreatorPageCover page={page} cover={cover} thingsCount={thingsCount} />
      <div className={measure()}>
        <CreatorHeader
          handle={page.username}
          displayName={page.displayName}
          avatarUrl={page.avatarUrl}
          bio={page.bio}
          greeting={page.greeting}
          followers={formatCount(page.followerCount)}
          counts={{ posts: String(posts.length), things: String(thingsCount) }}
          style={page.headerStyle}
          cover={cover}
          socials={<SocialsRow links={socials} mode={page.linkMode} />}
          share={
            <PageShare
              handle={page.username}
              displayName={page.displayName}
              avatarUrl={page.avatarUrl}
              meta={`${posts.length} posts · ${thingsCount} things`}
              trigger="pill"
            />
          }
        />
        {membership ? (
          <OwnerBand
            profileId={page.id}
            role={membership.role === "admin" ? "admin" : "manager"}
            appearance={{
              accent: page.accent,
              headerStyle: page.headerStyle,
              gridStyle: page.gridStyle,
              coverStyle: page.coverStyle,
              linkMode: page.linkMode,
            }}
          />
        ) : null}
        {!viewer.signedIn ? <AnonBand /> : null}
        {viewer.hasBusiness && !membership ? <BusinessBand profileId={page.id} /> : null}
        {/* The "Shelves" label belongs to ShelfChips now; the page had one too. */}
        {page.categories.length > 0 ? (
          <div className="mt-2.5">
            <CategoryChips
              handle={page.username}
              categories={page.categories}
              activeId={activeCategory?.id ?? null}
            />
          </div>
        ) : null}
        {/* v2: no "Shop" heading — the shelves row leads straight into the
            wall; the counts already live in the header's stat row. */}
        <div className="mt-4" />
        {activeCategory && shopCount === 0 ? (
          <EmptyState
            title="Nothing on this shelf yet"
            action={
              <Button variant="secondary" asChild>
                <Link href={`/${page.username}`}>See everything</Link>
              </Button>
            }
          >
            This shelf is empty — the rest of the page still has everything on it.
          </EmptyState>
        ) : (
          <PostGrid
            handle={page.username}
            posts={posts}
            products={products}
            layout={page.gridStyle}
          />
        )}
        <CommentsSection
          profileId={page.id}
          report={{ targetType: "profile", targetId: page.id, targetLabel: "this page" }}
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
          basePath={`/${page.username}`}
          // A page turn in the comments keeps the shelf the reader is on.
          preservedQuery={category ? { category } : undefined}
        />
      </div>
    </main>
  );
}
