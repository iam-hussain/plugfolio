import type { DiscoveryCreator, DiscoveryProduct } from "@plugfolio/core";
import { Search } from "lucide-react";
import Link from "next/link";
import { CreatorCard } from "./creator-card";
import { ProductCard } from "./product-card";

/**
 * The Explore surface (design-out discover, Dev Spec §06): heading, viewer
 * note, Creators/Products tabs, search, count line and the result grid. Fully
 * server-rendered — search is a plain GET form, tabs are links, no login
 * anywhere. Region/following/verified filters from the prototype wait for
 * that data to exist on profiles.
 */
export type ExploreTab = "creators" | "products";

export type ExploreScreenProps = {
  tab: ExploreTab;
  query: string;
  creators: readonly DiscoveryCreator[];
  products: readonly DiscoveryProduct[];
  signedIn: boolean;
};

function tabHref(tab: ExploreTab, query: string): string {
  const params = new URLSearchParams();
  if (tab === "products") params.set("tab", "products");
  if (query) params.set("q", query);
  const qs = params.toString();
  return qs ? `/explore?${qs}` : "/explore";
}

function Tab({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <Link
      // Route strings are built from validated enum + query; cast for typedRoutes.
      href={href as never}
      aria-current={active ? "page" : undefined}
      className={`-mb-px whitespace-nowrap border-b-2 py-3 text-sm font-semibold ${
        active ? "border-primary text-foreground" : "text-muted-foreground border-transparent"
      }`}
    >
      {children}
    </Link>
  );
}

export function ExploreScreen({ tab, query, creators, products, signedIn }: ExploreScreenProps) {
  const count =
    tab === "creators" ? `${creators.length} creators` : `${products.length} products`;
  const empty = tab === "creators" ? creators.length === 0 : products.length === 0;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-14 pt-7 lg:px-11">
      <h1 className="font-display text-[30px] font-extrabold tracking-[-0.03em]">
        Explore creators
      </h1>
      <p className="text-muted-foreground mt-1.5 text-sm">
        Search creators and products, then tap through to shop.
      </p>
      <p className="bg-muted border-border text-muted-foreground mt-3 inline-flex items-center gap-[7px] rounded-pill border px-[13px] py-1.5 font-mono text-[10.5px]">
        <span aria-hidden className="bg-primary size-1.5 rounded-full" />
        {signedIn
          ? "Signed in — follow creators to save them."
          : "You’re browsing as a guest — search and shop freely, no login needed."}
      </p>

      <nav aria-label="Explore tabs" className="border-border mt-5 flex gap-[22px] border-b">
        <Tab href={tabHref("creators", query)} active={tab === "creators"}>
          Creators
        </Tab>
        <Tab href={tabHref("products", query)} active={tab === "products"}>
          Products
        </Tab>
      </nav>

      <form
        action="/explore"
        method="get"
        className="border-border bg-background mt-[18px] flex items-center gap-2.5 rounded-[10px] border px-3.5"
      >
        {tab === "products" ? <input type="hidden" name="tab" value="products" /> : null}
        <Search aria-hidden strokeWidth={2.2} className="text-muted-foreground size-4 shrink-0" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search creators, products, or niches"
          aria-label="Search creators and products"
          className="text-foreground min-w-0 flex-1 bg-transparent py-[13px] text-sm outline-none"
        />
      </form>

      <p className="mt-3.5 flex items-center gap-2">
        <span aria-hidden className="bg-primary size-1.5 shrink-0 rounded-full" />
        <span className="text-muted-foreground/70 font-mono text-[11px]">{count}</span>
      </p>

      {empty ? (
        <p className="text-muted-foreground py-9 text-center text-sm">
          {query
            ? "Nothing matches that search — try widening it."
            : "Nothing here yet — creators are on their way."}
        </p>
      ) : tab === "creators" ? (
        <div className="mt-3 grid gap-3.5 lg:grid-cols-2 lg:gap-4">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        <div className="mt-3.5 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-3.5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
