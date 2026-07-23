import type {
  DiscoveryCreator,
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
const PAGE_SIZE = 24;

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
