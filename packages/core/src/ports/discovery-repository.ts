import type { ShopperProduct } from "./creator-page-repository";

/**
 * Read port for the public Explore surface (Dev Spec §06, no-login). Carries
 * exactly what the discovery cards render — counts and a thumbnail, never
 * dashboard- or account-shaped data.
 */
export type DiscoveryCreator = {
  readonly id: string;
  readonly username: string;
  readonly followerCount: number;
  readonly postCount: number;
  readonly productCount: number;
  /** Latest post media — the card's avatar stand-in until profiles carry one. */
  readonly latestMediaUrl: string | null;
};

export type DiscoveryProduct = ShopperProduct & {
  /** The creator it belongs to — "by @username" + the card's link target. */
  readonly username: string;
};

export type DiscoveryReadRepository = {
  /** Creators matching `query` (username contains, case-insensitive; "" = all). */
  listCreators(query: string, limit: number): Promise<readonly DiscoveryCreator[]>;
  /** Products matching `query` (title contains, case-insensitive; "" = all). */
  listProducts(query: string, limit: number): Promise<readonly DiscoveryProduct[]>;
};
