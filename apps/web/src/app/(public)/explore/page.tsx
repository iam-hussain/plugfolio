import type { Metadata } from "next";
import {
  exploreCreators,
  explorePosts,
  exploreProducts,
  getLiveAdPlacement,
} from "@plugfolio/core";
import { ExploreScreen, type ExploreTab } from "@/features/explore";
import { auth } from "@/server/auth";
import { adPlacementDeps, repositories } from "@/server/container";

// The no-login discovery surface (design-out discover, Dev Spec §06). A static
// `explore` segment takes precedence over the `[handle]` route. RSC calls the
// read service directly (§6.11); search/tab arrive as URL params — never a wall.
export const metadata: Metadata = {
  title: "Explore",
  description:
    "Browse creators and shop their tagged products — search freely, no account needed.",
  // Search/tab params (?q, ?tab) are the same page — canonicalize to the bare
  // route so engines don't split its authority across every query string.
  alternates: { canonical: "/explore" },
  openGraph: { url: "/explore" },
};

type SearchParams = { q?: string; tab?: string };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, tab: rawTab } = await searchParams;
  // Scope by KIND (DESIGN explore.html): All is the default; things ≡ products.
  const tab: ExploreTab =
    rawTab === "creators"
      ? "creators"
      : rawTab === "posts"
        ? "posts"
        : rawTab === "products" || rawTab === "things"
          ? "products"
          : "all";
  const session = await auth();

  const deps = { discovery: repositories.discovery };
  const [creators, posts, products, ad] = await Promise.all([
    tab === "all" || tab === "creators" ? exploreCreators(deps, q) : Promise.resolve([]),
    tab === "all" || tab === "posts" ? explorePosts(deps, q) : Promise.resolve([]),
    tab === "all" || tab === "products" ? exploreProducts(deps, q) : Promise.resolve([]),
    // Null whenever an admin hasn't switched ads on, which is the default
    // (ADR-0020). Nothing renders, and the wall doesn't know it exists.
    getLiveAdPlacement(adPlacementDeps),
  ]);

  return (
    <ExploreScreen
      tab={tab}
      query={(q ?? "").trim()}
      creators={creators}
      posts={posts}
      products={products}
      ad={ad}
      signedIn={!!session?.user}
    />
  );
}
