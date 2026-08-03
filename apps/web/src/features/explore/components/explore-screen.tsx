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

/** A results section takes breathing room only when something precedes it. */
const sectionHead = cva("flex items-baseline justify-between gap-4", {
  variants: { divided: { true: "mt-[26px]", false: "" } },
  defaultVariants: { divided: false },
});

/** v2 scope chips: 11px-radius, selected fills with the accent. */
const scopeChip = cva(
  "rounded-md flex min-h-11 shrink-0 items-center px-[15px] text-label font-semibold whitespace-nowrap transition-colors",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground border border-transparent",
        false: "border-border-strong text-foreground/80 hover:border-primary hover:text-primary border",
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
  { label: "Things", tab: "products" },
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
        <h2 className="text-faint text-pico tracking-eyebrow font-mono font-bold uppercase">
          {title}
        </h2>
        <span className="text-faint text-nano">{meta}</span>
      </div>
      {href ? (
        <Link
          href={href}
          className="text-primary text-label whitespace-nowrap font-semibold hover:underline"
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
      {/* ── the v2 search head: plain canvas, the card-filled field, the
          scope chips and the mono result line (ADR-0026). Search stays a
          plain GET form — no login, no JS required (§2.2). ── */}
      <div className={cn(measure(), "pt-[22px]")}>
        <form action="/explore" method="get" role="search" className="flex gap-2.5">
          <label className="rounded-lg border-border-strong bg-card flex h-[52px] flex-1 items-center gap-2.5 border px-[18px] focus-within:border-primary">
            <Search aria-hidden className="size-[17px] shrink-0 opacity-50" />
            <span className="sr-only">Search captions, creators and things</span>
            <input
              type="search"
              name="q"
              maxLength={80}
              defaultValue={query}
              autoComplete="off"
              placeholder="Search captions, creators, things"
              className="text-body min-h-11 flex-1 bg-transparent focus:outline-none"
            />
            {query ? (
              <Link
                href={scopeHref(tab, "")}
                className="text-faint text-nano font-mono tracking-[0.06em]"
              >
                CLEAR
              </Link>
            ) : null}
          </label>
          <button type="submit" className="sr-only">
            Search
          </button>
        </form>

        <nav
          aria-label="Show"
          className="mt-3 flex gap-[7px] overflow-x-auto pb-0.5 [scrollbar-width:none]"
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

        <p className="text-faint text-nano mt-3.5 font-mono tracking-[0.06em]">{count}</p>
      </div>

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
                <section>
                  <SectionHead
                    title="Creators"
                    meta={plural(creators.length, "page")}
                    href={teaser ? scopeHref("creators", query) : undefined}
                    divided={false}
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {creators.map((creator) => (
                      <CreatorCard key={creator.id} creator={creator} />
                    ))}
                  </div>
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
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
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
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
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
