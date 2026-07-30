import type {
  DiscoveryCreator,
  DiscoveryPost,
  DiscoveryProduct,
  DiscoveryReadRepository,
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
