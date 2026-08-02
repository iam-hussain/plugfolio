import type {
  CommentPage,
  CommentSort,
  CreatorPage,
  CreatorProductRow,
  ProfileLinkView,
} from "@plugfolio/core";
import {
  Button,
  CreatorCover,
  CreatorHeader,
  EmptyState,
  measure,
  PageBand,
  SocialsRow,
} from "@plugfolio/ui";
import Link from "next/link";
import { RequestCollabForm } from "@/features/business-collab";
import { CommentsSection, FollowButton } from "@/features/shopper-account";
import { formatCount } from "@/lib/format-count";
import { CategoryChips } from "./category-chips";
import { CreatorContextBar } from "./creator-context-bar";
import { CustomiseDrawer } from "./customise-drawer";
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
 * and the comment composer are client islands.
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

  // Hidden posts (brief 07) never reach visitors — only the dashboard shows
  // them. Category chips filter the rest (ADR-0010); "All" holds everything.
  const visiblePosts = page.posts.filter((post) => post.hiddenAt === null);
  // A shelf can also hold products the creator sells or recommends directly,
  // with no post behind them (design §"two kinds of thing, one wall"). Products
  // already tagged inside a post are shown via that post — not twice.
  const standaloneProducts = allProducts.filter((product) => product.postCount === 0);
  const activeCategory = page.categories.find((c) => c.id === category) ?? null;
  const posts = activeCategory
    ? visiblePosts.filter((post) => post.categoryId === activeCategory.id)
    : visiblePosts;
  const products = activeCategory
    ? standaloneProducts.filter((product) => product.categoryId === activeCategory.id)
    : standaloneProducts;
  const shopCount = posts.length + products.length;
  // "41 things tagged" — tag instances inside posts, which is what the phrase
  // means; the standalone products are already counted on their own.
  const thingsTagged = posts.reduce((total, post) => total + post.products.length, 0);

  const { membership } = viewer;
  // ADR-0009 default: on your own page you speak as the profile; the picker
  // lets a member choose otherwise, per comment.
  const defaultAsProfileId = viewer.identities.some((identity) => identity.id === page.id)
    ? page.id
    : null;

  const follow = (
    <FollowButton
      profileId={page.id}
      isAuthenticated={viewer.signedIn}
      initiallyFollowing={viewer.following}
    />
  );

  // The header's action slot. The context bar below carries its own Follow —
  // safe to duplicate because each renders from the server's answer and
  // refreshes it on success, so both copies land back on one truth. The tapped
  // one flips instantly; the other catches up on that refresh.
  const headerAction = membership ? (
    // The owner's two tools sit where a visitor's Follow sits (DESIGN
    // §.ch-act > .owner-tools). They used to live in a band under the header
    // captioned "this is your page" — a whole strip of chrome to say what the
    // presence of the tools already says.
    <>
      <Button variant="secondary" asChild>
        <Link href={{ pathname: "/dashboard", query: { profile: page.id } }}>Dashboard</Link>
      </Button>
      {membership.role === "admin" ? (
        // The page's own live editor (ADR-0017): the drawer opens over the
        // page, so the creator edits against the real thing.
        <CustomiseDrawer
          profileId={page.id}
          role={membership.role}
          appearance={{
            accent: page.accent,
            headerStyle: page.headerStyle,
            gridStyle: page.gridStyle,
            greeting: page.greeting,
          }}
        />
      ) : null}
    </>
  ) : (
    follow
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
      {/* Edge to edge, outside the measure — the band the page opens with
          (DESIGN creator.html: `.cover` is a direct child of `<main>`, and
          only what follows it sits inside `.inner`). */}
      <CreatorCover style={page.headerStyle} />
      <div className={measure()}>
        <CreatorHeader
          handle={page.username}
          displayName={page.displayName}
          avatarUrl={page.avatarUrl}
          bio={page.bio}
          greeting={page.greeting}
          followers={formatCount(page.followerCount)}
          style={page.headerStyle}
          socials={<SocialsRow links={socials} />}
          share={
            <PageShare
              handle={page.username}
              displayName={page.displayName}
              avatarUrl={page.avatarUrl}
              meta={`${posts.length} posts · ${thingsTagged} things`}
            />
          }
          action={headerAction}
        />
        {viewer.hasBusiness && !membership ? (
          // A band that belongs to one viewer only (DESIGN §.band-biz).
          <PageBand layout="stack">
            <p className="text-primary text-micro pb-2 font-bold uppercase tracking-[0.08em]">
              You own a business
            </p>
            <RequestCollabForm profileId={page.id} />
          </PageBand>
        ) : null}
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
        <div className="mb-3.5 mt-[22px] flex items-baseline gap-3">
          <h2 className="text-title font-extrabold tracking-[-0.02em]">Shop</h2>
          <span className="text-muted-foreground text-micro ml-auto font-semibold uppercase tracking-[0.06em]">
            {posts.length} post{posts.length === 1 ? "" : "s"}
            {products.length > 0
              ? ` · ${products.length} product${products.length === 1 ? "" : "s"}`
              : ""}
            {thingsTagged > 0
              ? ` · ${thingsTagged} thing${thingsTagged === 1 ? "" : "s"} tagged`
              : ""}
          </span>
        </div>
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
