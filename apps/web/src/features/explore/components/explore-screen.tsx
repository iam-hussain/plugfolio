import type { DiscoveryCreator, DiscoveryPost, DiscoveryProduct } from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import type { Route } from "next";
import { Search } from "lucide-react";
import Link from "next/link";
import { CreatorCard } from "./creator-card";
import { PostWallCard } from "./post-wall-card";
import { ProductCard } from "./product-card";

/**
 * The Explore surface (DESIGN explore.html — "the tagged wall"): a mode-coloured
 * gradient hero carrying the search and the scope chips, then a canvas sheet
 * with the creator fan and the products grid. Fully server-rendered — search is
 * a plain GET form, the chips are links, no login anywhere (§2.2). The hero's
 * colour follows the shopper MODE, never a creator's page.
 *
 * The prototype's posts wall (tiles with tags pinned by coordinate) and the
 * Following feed aren't here yet: neither tag positions nor a following-feed
 * read exists in the data model. Creators + products are what discovery serves.
 */
export type ExploreTab = "all" | "creators" | "posts" | "products";

export type ExploreScreenProps = {
  tab: ExploreTab;
  query: string;
  creators: readonly DiscoveryCreator[];
  posts: readonly DiscoveryPost[];
  products: readonly DiscoveryProduct[];
  signedIn: boolean;
};

function scopeHref(tab: ExploreTab, query: string): Route {
  const params = new URLSearchParams();
  if (tab !== "all") params.set("tab", tab);
  if (query) params.set("q", query);
  const qs = params.toString();
  return (qs ? `/explore?${qs}` : "/explore") as Route;
}

const SHELVES: readonly { label: string; tab: ExploreTab }[] = [
  { label: "All", tab: "all" },
  { label: "Creators", tab: "creators" },
  { label: "Posts", tab: "posts" },
  { label: "Products", tab: "products" },
];

function Empty({
  title,
  copy,
  cta,
}: {
  title: string;
  copy: string;
  cta: { label: string; href: Route; primary?: boolean };
}) {
  return (
    <div className="border-border bg-card rounded-bay my-8 border p-[clamp(34px,6vw,64px)] text-center">
      <h2 className="font-display mx-auto max-w-[24ch] text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.03em]">
        {title}
      </h2>
      <p className="text-muted-foreground mx-auto mt-3 max-w-[44ch] text-[0.9375rem] leading-[1.6]">
        {copy}
      </p>
      <Button variant={cta.primary ? "primary" : "secondary"} asChild className="mt-6">
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    </div>
  );
}

export function ExploreScreen({ tab, query, creators, posts, products }: ExploreScreenProps) {
  const showCreators = tab === "all" || tab === "creators";
  const showPosts = tab === "all" || tab === "posts";
  const showProducts = tab === "all" || tab === "products";
  const hasResults =
    (showCreators && creators.length > 0) ||
    (showPosts && posts.length > 0) ||
    (showProducts && products.length > 0);
  const count = query
    ? `Results for “${query}”`
    : `${posts.length} posts · ${products.length} things`;

  return (
    <div className="bg-background min-h-[70vh]">
      {/* ── the gradient hero (shopper mode) ── */}
      <div data-role="shopper" className="bg-role-gradient text-white">
        <div className="mx-auto w-full max-w-[1180px] px-5 pt-8 pb-16 lg:px-11">
          <div className="flex flex-wrap items-baseline gap-4">
            <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.035em]">
              Explore
            </h1>
            <p className="rounded-pill bg-white/15 px-3.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.04em] uppercase">
              {count}
            </p>
          </div>

          <form
            action="/explore"
            method="get"
            role="search"
            className="mt-6 flex max-w-[640px] flex-wrap gap-2.5"
          >
            <label className="flex min-h-[54px] flex-1 basis-[260px] items-center gap-2.5 rounded-pill border border-white/30 bg-white/15 px-4 focus-within:border-white">
              <Search aria-hidden className="size-5 shrink-0" />
              <span className="sr-only">Search posts, people and things</span>
              <input
                type="search"
                name="q"
                maxLength={80}
                defaultValue={query}
                autoComplete="off"
                placeholder="Search posts, people, things…"
                className="min-h-11 flex-1 bg-transparent text-white placeholder:text-white/70 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="bg-card text-foreground rounded-pill min-h-[54px] px-6 text-sm font-semibold"
            >
              Search
            </button>
          </form>

          <nav
            aria-label="Show"
            className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
          >
            {SHELVES.map((shelf) => {
              const active = shelf.tab === tab;
              return (
                <Link
                  key={shelf.tab}
                  href={scopeHref(shelf.tab, query)}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-pill flex min-h-11 shrink-0 items-center px-[18px] text-sm font-semibold whitespace-nowrap ${
                    active
                      ? "bg-card text-foreground border border-white"
                      : "border border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/20"
                  }`}
                >
                  {shelf.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── the sheet (canvas) ── */}
      <div className="bg-background rounded-t-bay relative z-10 -mt-6">
        <div className="mx-auto w-full max-w-[1180px] px-5 pt-8 pb-16 lg:px-11">
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
                cta={{ label: "Create your page", href: "/join?as=creator" as Route, primary: true }}
              />
            )
          ) : (
            <>
              {showCreators && creators.length > 0 ? (
                <section>
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-display text-xl font-bold tracking-[-0.02em]">
                      {query ? `Creators · ${creators.length}` : "Creators"}
                    </h2>
                    {tab === "all" ? (
                      <Link
                        href={scopeHref("creators", query)}
                        className="text-brand-violet-deep text-[13px] font-bold whitespace-nowrap"
                      >
                        See all creators →
                      </Link>
                    ) : null}
                  </div>
                  <div
                    className={
                      tab === "creators"
                        ? "mt-[18px] grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4"
                        : "mt-5 flex snap-x overflow-x-auto pt-2 pb-6 [scrollbar-width:none]"
                    }
                  >
                    {creators.map((creator, index) => (
                      <CreatorCard
                        key={creator.id}
                        creator={creator}
                        index={index}
                        layout={tab === "creators" ? "grid" : "fan"}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {showPosts && posts.length > 0 ? (
                <section className={showCreators && creators.length > 0 ? "mt-2" : ""}>
                  <div
                    className={`flex items-baseline justify-between gap-4 ${
                      showCreators && creators.length > 0 ? "border-border border-t pt-[22px]" : ""
                    }`}
                  >
                    <div className="flex items-baseline gap-3">
                      <h2 className="font-display text-xl font-bold tracking-[-0.02em]">
                        {query ? `Posts · ${posts.length}` : "Latest posts"}
                      </h2>
                      <span className="text-muted-foreground text-[13px]">
                        {query ? `${posts.length} match “${query}”` : `${posts.length} posts`}
                      </span>
                    </div>
                    {tab === "all" ? (
                      <Link
                        href={scopeHref("posts", query)}
                        className="text-brand-violet-deep text-[13px] font-bold whitespace-nowrap"
                      >
                        See all posts →
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-5 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {posts.map((post, index) => (
                      <PostWallCard key={post.id} post={post} index={index} />
                    ))}
                  </div>
                </section>
              ) : null}

              {showProducts && products.length > 0 ? (
                <section
                  className={
                    (showCreators && creators.length > 0) || (showPosts && posts.length > 0)
                      ? "mt-2"
                      : ""
                  }
                >
                  <div
                    className={`flex items-baseline justify-between gap-4 ${
                      (showCreators && creators.length > 0) || (showPosts && posts.length > 0)
                        ? "border-border border-t pt-[22px]"
                        : ""
                    }`}
                  >
                    <div className="flex items-baseline gap-3">
                      <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Products</h2>
                      <span className="text-muted-foreground text-[13px]">
                        {query ? `${products.length} match “${query}”` : `${products.length} tagged`}
                      </span>
                    </div>
                    {tab === "all" ? (
                      <Link
                        href={scopeHref("products", query)}
                        className="text-brand-violet-deep text-[13px] font-bold whitespace-nowrap"
                      >
                        See all products →
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4 pb-2 sm:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
