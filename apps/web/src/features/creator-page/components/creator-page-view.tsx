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
import { cn } from "@plugfolio/ui";
import Link from "next/link";
import {
  PillNavDivider,
  PillNavOverride,
  pillNavCircle,
} from "@/components/chrome/pill-nav";
import { RequestCollabForm } from "@/features/business-collab";
import { CommentsSection, FollowButton } from "@/features/shopper-account";
import { formatCount } from "@/lib/format-count";
import { CategoryChips } from "./category-chips";
import { CreatorContextBar } from "./creator-context-bar";
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


  // Stored, resolved at the read (ADR-0026): the drawer writes them, the
  // repository resolves nulls against the header style.
  const cover = page.coverStyle;
  const thingsCount = thingsTagged + products.length;

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
      {/* The pill nav morphs into this page's verbs (ADR-0026 §6): the way
          back to Explore, Follow (or the owner's Dashboard), and Share. */}
      <PillNavOverride>
        <Link
          href="/explore"
          className="text-nav-foreground text-pico tracking-eyebrow flex items-center gap-2 pl-2 font-mono font-bold uppercase"
        >
          <span aria-hidden>←</span> Explore
        </Link>
        <PillNavDivider />
        {membership ? (
          <Button variant="action" className="px-5" asChild>
            <Link href={{ pathname: "/dashboard", query: { profile: page.id } }}>Dashboard</Link>
          </Button>
        ) : (
          follow
        )}
        <PageShare
          handle={page.username}
          displayName={page.displayName}
          avatarUrl={page.avatarUrl}
          meta={`${posts.length} posts · ${thingsCount} things`}
          trigger="circle"
          className={pillNavCircle}
        />
      </PillNavOverride>
      {/* The cover: band and none run edge to edge above the measure; the
          tile treatment sits inside it (v2 §Layout). */}
      {cover === "tile" ? (
        <div className={cn(measure(), "pt-3")}>
          <CreatorCover
            treatment="tile"
            tall={page.headerStyle === "centred"}
            badge={thingsCount > 0 ? `${thingsCount} things live` : null}
          />
        </div>
      ) : (
        <CreatorCover treatment={cover} tall={page.headerStyle === "centred"} />
      )}
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
            links={links}
          />
        ) : null}
        {!viewer.signedIn ? (
          // The anon band (v2): shopping never needs an account — say it once,
          // quietly, with the one door for follow/comment.
          <div className="border-border bg-card rounded-row mb-4 flex flex-wrap items-center justify-between gap-3 border px-4 py-3.5">
            <p className="text-muted-foreground text-label leading-normal">
              Shopping this page never needs an account.{" "}
              <b className="text-foreground font-semibold">Sign in only to follow or comment.</b>
            </p>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          </div>
        ) : null}
        {viewer.hasBusiness && !membership ? (
          // A band that belongs to one viewer only (v2 §.band-biz): accent
          // border, the one collab door.
          <PageBand layout="stack" className="border-primary">
            <p className="text-primary text-pico tracking-eyebrow pb-2 font-mono font-bold uppercase">
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
