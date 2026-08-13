import type {
  DiscoveryCreator,
  DiscoveryPost,
  DiscoveryProduct,
  DiscoveryReadRepository,
  SitemapCreator,
} from "../ports/discovery-repository";

/**
 * Explore read use-cases (no-login discovery). Query text comes from a URL —
 * trim and clamp here so repositories never see unbounded input.
 */
export type ExploreDeps = {
  discovery: DiscoveryReadRepository;
};

const MAX_QUERY_LENGTH = 80;
/** What one Explore read returns. Exported so the wall can say honestly
 *  whether it reached the end or just the cap. */
export const EXPLORE_PAGE_SIZE = 24;
const PAGE_SIZE = EXPLORE_PAGE_SIZE;

function cleanQuery(query: string | undefined): string {
  return (query ?? "").trim().slice(0, MAX_QUERY_LENGTH);
}

export async function exploreCreators(
  deps: ExploreDeps,
  query?: string,
): Promise<readonly DiscoveryCreator[]> {
  return deps.discovery.listCreators(cleanQuery(query), PAGE_SIZE);
}

export async function exploreProducts(
  deps: ExploreDeps,
  query?: string,
): Promise<readonly DiscoveryProduct[]> {
  return deps.discovery.listProducts(cleanQuery(query), PAGE_SIZE);
}

export async function explorePosts(
  deps: ExploreDeps,
  query?: string,
): Promise<readonly DiscoveryPost[]> {
  return deps.discovery.listPosts(cleanQuery(query), PAGE_SIZE);
}

/** Ceiling on creators in one sitemap read — far above today's data, well
 *  under the 50k-URL sitemap limit. Revisit with generateSitemaps when a
 *  creator count in the thousands makes one file too big. */
const SITEMAP_CREATOR_LIMIT = 5000;

/** Every live creator with their visible posts/products, for sitemap.xml. */
export async function sitemapCreators(deps: ExploreDeps): Promise<readonly SitemapCreator[]> {
  return deps.discovery.listSitemapCreators(SITEMAP_CREATOR_LIMIT);
}
