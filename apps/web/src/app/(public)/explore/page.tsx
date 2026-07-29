import type { Metadata } from "next";
import { exploreCreators, explorePosts, exploreProducts } from "@plugfolio/core";
import { ExploreScreen, type ExploreTab } from "@/features/explore";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The no-login discovery surface (design-out discover, Dev Spec §06). A static
// `explore` segment takes precedence over the `[handle]` route. RSC calls the
// read service directly (§6.11); search/tab arrive as URL params — never a wall.
export const metadata: Metadata = {
  title: "Explore",
  description:
    "Browse creators and shop their tagged products — search freely, no account needed.",
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
  const [creators, posts, products] = await Promise.all([
    tab === "all" || tab === "creators" ? exploreCreators(deps, q) : Promise.resolve([]),
    tab === "all" || tab === "posts" ? explorePosts(deps, q) : Promise.resolve([]),
    tab === "all" || tab === "products" ? exploreProducts(deps, q) : Promise.resolve([]),
  ]);

  return (
    <ExploreScreen
      tab={tab}
      query={(q ?? "").trim()}
      creators={creators}
      posts={posts}
      products={products}
      signedIn={!!session?.user}
    />
  );
}
