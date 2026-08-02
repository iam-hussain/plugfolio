import type { ShopperProduct } from "./creator-page-repository";

/**
 * Read port for the public Explore surface (Dev Spec §06, no-login). Carries
 * exactly what the discovery cards render — counts and a thumbnail, never
 * dashboard- or account-shaped data.
 */
export type DiscoveryCreator = {
  readonly id: string;
  readonly username: string;
  /** The public name (brief 10); null = the card leads with the @handle. */
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly followerCount: number;
  readonly postCount: number;
  readonly productCount: number;
  /** Latest post media — the card's avatar stand-in until profiles carry one. */
  readonly latestMediaUrl: string | null;
};

export type DiscoveryProduct = ShopperProduct & {
  /** The creator it belongs to — "by @username" + the card's link target. */
  readonly username: string;
  /** That creator's avatar, for the card byline. */
  readonly avatarUrl: string | null;
};

/** One tagged product pinned on a wall post — name, price and the anchor tone. */
export type DiscoveryPostTag = {
  readonly productId: string;
  readonly name: string;
  readonly priceCents: number | null;
  readonly currency: string;
  /** offer = live coupon, own = creator's product, affiliate = plain (§Tags). */
  readonly tone: "affiliate" | "offer" | "own";
};

/** A post on the explore wall — the shoppable tile ("tap a post, see the thing"). */
export type DiscoveryPost = {
  readonly id: string;
  readonly username: string;
  /** The creator's avatar, for the card byline. */
  readonly avatarUrl: string | null;
  readonly mediaUrl: string;
  /** The post's own words — the card's title. Null = it never had a caption. */
  readonly caption: string | null;
  /** Up to 3 tags shown on the tile; the rest collapse into a "+N" pill. */
  readonly tags: readonly DiscoveryPostTag[];
  readonly productCount: number;
};

export type DiscoveryReadRepository = {
  /** Creators matching `query` (username contains, case-insensitive; "" = all). */
  listCreators(query: string, limit: number): Promise<readonly DiscoveryCreator[]>;
  /** Products matching `query` (title contains, case-insensitive; "" = all). */
  listProducts(query: string, limit: number): Promise<readonly DiscoveryProduct[]>;
  /** Visible posts matching `query` (caption or handle; "" = all), newest first. */
  listPosts(query: string, limit: number): Promise<readonly DiscoveryPost[]>;
};
