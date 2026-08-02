import type {
  AdPlacement,
  DiscoveryCreator,
  DiscoveryPost,
  DiscoveryProduct,
} from "@plugfolio/core";
import { EXPLORE_PAGE_SIZE } from "@plugfolio/core";
import {
  AdSlot,
  AdSlotWhy,
  Button,
  cn,
  DiscoveryGrid,
  DiscoveryRail,
  measure,
  WallEnd,
  WallEndNote,
} from "@plugfolio/ui";
import Image from "next/image";
import type { Route } from "next";
import { Search } from "lucide-react";
import Link from "next/link";
import { CreatorCard } from "./creator-card";
import { PostCard } from "./post-card";
import { ProductCard } from "./product-card";
import { cva } from "class-variance-authority";

/** A results section takes a rule above it only when something precedes it. */
const sectionHead = cva("flex items-baseline justify-between gap-4", {
  variants: { divided: { true: "border-border mt-9 border-t pt-[26px]", false: "" } },
  defaultVariants: { divided: false },
});

/** The scope chips sit on the violet band, so their states are white-on-tint. */
const scopeChip = cva(
  "rounded-pill flex min-h-11 shrink-0 items-center px-[18px] text-label font-semibold whitespace-nowrap",
  {
    variants: {
      active: {
        true: "bg-card text-foreground border border-white",
        false: "border border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/20",
      },
    },
    defaultVariants: { active: false },
  },
);

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

/** "1 creator", "4 creators" — a count pill that reads "1 creators" is a typo. */
function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/** One header shape for all three sections: name, count, and the way out. */
function SectionHead({
  title,
  meta,
  href,
  divided,
}: {
  title: string;
  meta: string;
  /** The "see all" link — only on the All tab, where a section is a teaser. */
  href?: Route;
  divided: boolean;
}) {
  return (
    <div className={sectionHead({ divided })}>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-title font-bold tracking-[-0.02em]">{title}</h2>
        <span className="text-muted-foreground text-label font-semibold">{meta}</span>
      </div>
      {href ? (
        <Link
          href={href}
          className="text-brand-violet-deep text-label whitespace-nowrap font-bold hover:underline"
        >
          See all →
        </Link>
      ) : null}
    </div>
  );
}

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
      <h2 className="font-display text-display-sm mx-auto max-w-[24ch] font-bold tracking-[-0.03em]">
        {title}
      </h2>
      <p className="text-muted-foreground text-copy mx-auto mt-3 max-w-[44ch] leading-[1.6]">
        {copy}
      </p>
      <Button variant={cta.primary ? "primary" : "secondary"} asChild className="mt-6">
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    </div>
  );
}

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
      {/* ── the gradient hero (shopper mode) ── */}
      <div data-role="shopper" className="bg-role-gradient text-white">
        <div className={cn(measure(), "pb-16 pt-8")}>
          <div className="flex flex-wrap items-baseline gap-4">
            <h1 className="font-display text-display-lg font-extrabold tracking-[-0.035em]">
              Explore
            </h1>
            <p className="rounded-pill text-nano bg-white/15 px-3.5 py-1.5 font-mono font-bold uppercase tracking-[0.04em]">
              {count}
            </p>
          </div>

          <form
            action="/explore"
            method="get"
            role="search"
            className="mt-6 flex max-w-[640px] flex-wrap gap-2.5"
          >
            <label className="rounded-pill flex min-h-[54px] flex-1 basis-[260px] items-center gap-2.5 border border-white/30 bg-white/15 px-4 focus-within:border-white">
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
              className="bg-card text-foreground rounded-pill text-copy min-h-[54px] px-6 font-semibold"
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
                  className={scopeChip({ active })}
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
        <div className={cn(measure(), "pb-16 pt-8")}>
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
                <section>
                  <SectionHead
                    title="Creators"
                    meta={plural(creators.length, "page")}
                    href={teaser ? scopeHref("creators", query) : undefined}
                    divided={false}
                  />
                  {/* The deck on All, the shared grid once this IS the result. */}
                  {teaser ? (
                    <DiscoveryRail>
                      {creators.map((creator, index) => (
                        <CreatorCard
                          key={creator.id}
                          creator={creator}
                          index={index}
                          layout="rail"
                        />
                      ))}
                    </DiscoveryRail>
                  ) : (
                    <DiscoveryGrid>
                      {creators.map((creator, index) => (
                        <CreatorCard
                          key={creator.id}
                          creator={creator}
                          index={index}
                          layout="grid"
                        />
                      ))}
                    </DiscoveryGrid>
                  )}
                </section>
              ) : null}

              {showPosts ? (
                <section>
                  <SectionHead
                    title={query ? "Posts" : "Latest posts"}
                    meta={plural(posts.length, "post")}
                    href={teaser ? scopeHref("posts", query) : undefined}
                    divided={showCreators}
                  />
                  {ad ? (
                    <AdSlot
                      href={ad.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      title={ad.title}
                      description={ad.description}
                      image={
                        ad.imageUrl ? (
                          /* ponytail: unoptimized until image domains are pinned */
                          <Image
                            src={ad.imageUrl}
                            alt=""
                            width={208}
                            height={208}
                            unoptimized
                            className="size-full object-cover"
                          />
                        ) : null
                      }
                      why={
                        <AdSlotWhy title="Placed by Plugfolio. Not a creator's pick, and not chosen from anything you did — this surface has no account to target against.">
                          Why this?
                        </AdSlotWhy>
                      }
                    />
                  ) : null}
                  <DiscoveryGrid>
                    {posts.map((post, index) => (
                      <PostCard key={post.id} post={post} index={index} />
                    ))}
                  </DiscoveryGrid>
                </section>
              ) : null}

              {showProducts ? (
                <section>
                  <SectionHead
                    title="Things"
                    meta={`${plural(products.length, "thing")} tagged`}
                    href={teaser ? scopeHref("products", query) : undefined}
                    divided={showCreators || showPosts}
                  />
                  <DiscoveryGrid>
                    {products.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </DiscoveryGrid>
                </section>
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
