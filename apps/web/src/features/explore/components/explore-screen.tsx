import type {
  AdPlacement,
  DiscoveryCreator,
  DiscoveryPost,
  DiscoveryProduct,
} from "@plugfolio/core";
import { EXPLORE_PAGE_SIZE } from "@plugfolio/core";
import { cn, measure, WallEnd, WallEndNote } from "@plugfolio/ui";
import type { Route } from "next";
import { plural } from "@/lib/plural";
import { Empty, scopeHref } from "./explore-parts";
import { ExploreSearchHead } from "./explore-search-head";
import { CreatorsSection, PostsSection, ProductsSection } from "./explore-sections";

/**
 * The Explore surface (DESIGN explore.html — "the tagged wall"): a mode-coloured
 * gradient hero carrying the search and the scope chips, then a canvas sheet
 * with the results. Fully server-rendered — search is a plain GET form, the
 * chips are links, no login anywhere (§2.2). The hero's colour follows the
 * shopper MODE, never a creator's page.
 *
 * **Every section is the same card on the same grid** (`DiscoveryCard`): a
 * creator, a post and a thing differ in what they say, never in how they are
 * built, so the columns line up the whole way down the page. The one exception
 * is the creator deck on the All tab, a rail that says "there is more of this
 * sideways" — scoped to Creators it drops into the same grid as everything
 * else, because a result set has to say "this is the set".
 *
 * The search head, the result sections and the shared parts live in sibling
 * files; this screen loads and composes them.
 */
export type ExploreTab = "all" | "creators" | "posts" | "products";

export type ExploreScreenProps = {
  tab: ExploreTab;
  query: string;
  creators: readonly DiscoveryCreator[];
  posts: readonly DiscoveryPost[];
  products: readonly DiscoveryProduct[];
  /** The live sponsored placement (ADR-0020); null when ads are off. */
  ad?: AdPlacement | null;
  signedIn: boolean;
};

export function ExploreScreen({ tab, query, creators, posts, products, ad }: ExploreScreenProps) {
  // What the wall actually rendered, and whether the read hit its cap.
  const shown = creators.length + posts.length + products.length;
  const atCap = [creators.length, posts.length, products.length].some(
    (n) => n >= EXPLORE_PAGE_SIZE,
  );
  const showCreators = (tab === "all" || tab === "creators") && creators.length > 0;
  const showPosts = (tab === "all" || tab === "posts") && posts.length > 0;
  const showProducts = (tab === "all" || tab === "products") && products.length > 0;
  const hasResults = showCreators || showPosts || showProducts;
  const teaser = tab === "all";
  // The pill counts what the page is actually showing. Scoped to Posts it used
  // to read "2 posts · 0 things" — a zero for something nobody asked to see.
  const count = query
    ? `Results for “${query}”`
    : tab === "creators"
      ? plural(creators.length, "creator")
      : tab === "posts"
        ? plural(posts.length, "post")
        : tab === "products"
          ? plural(products.length, "thing")
          : `${plural(posts.length, "post")} · ${plural(products.length, "thing")}`;

  return (
    <div className="bg-background min-h-[70vh]">
      <ExploreSearchHead tab={tab} query={query} count={count} />

      {/* ── the wall ── */}
      <div>
        <div className={cn(measure(), "pb-16 pt-2")}>
          {!hasResults ? (
            query ? (
              <Empty
                title="Nothing matches that search — try widening it."
                copy="Search looks at post captions, creator handles and the things tagged in them. Fewer words usually finds more."
                cta={{ label: "Clear search", href: "/explore" as Route }}
              />
            ) : (
              <Empty
                title="Nothing here yet — creators are on their way."
                copy="This is the only screen in Plugfolio where there is genuinely nothing to shop. If you make content, this is a good moment to claim your handle."
                cta={{
                  label: "Create your page",
                  href: "/join?as=creator" as Route,
                  primary: true,
                }}
              />
            )
          ) : (
            <>
              {showCreators ? (
                <CreatorsSection
                  creators={creators}
                  href={teaser ? scopeHref("creators", query) : undefined}
                  divided={false}
                />
              ) : null}

              {showPosts ? (
                <PostsSection
                  posts={posts}
                  query={query}
                  ad={ad}
                  href={teaser ? scopeHref("posts", query) : undefined}
                  divided={showCreators}
                />
              ) : null}

              {showProducts ? (
                <ProductsSection
                  products={products}
                  href={teaser ? scopeHref("products", query) : undefined}
                  divided={showCreators || showPosts}
                />
              ) : null}

              {/* A list that simply stops reads as a list that broke, so the
                  wall always says which end it reached. The read is capped at
                  PAGE_SIZE with no paging yet — saying "that's everything"
                  there would be a lie, so it says what it actually is.
                  ponytail: real ?page= paging when the discovery reads take a
                  skip; the design's "Load more" is a plain link, by design. */}
              {shown > 0 ? (
                <WallEnd>
                  <WallEndNote>
                    {atCap
                      ? `Showing the first ${shown} — search to narrow it down.`
                      : "That's everything for now. More lands as creators tag their posts."}
                  </WallEndNote>
                </WallEnd>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
