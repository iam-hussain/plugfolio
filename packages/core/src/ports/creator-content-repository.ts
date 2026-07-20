/**
 * Ports for the creator's back room (lean journey: Posts + Products tabs).
 * Writes only — the dashboard reads reuse the shopper read models, which
 * already carry everything the tabs render.
 */

/** Whether the user has ANY connected social (ADR-0004: a profile needs one). */
export type ConnectionReadRepository = {
  hasAny(userId: string): Promise<boolean>;
};

export type PostWriteRepository = {
  create(post: {
    profileId: string;
    mediaUrl: string;
    caption: string | null;
  }): Promise<{ id: string }>;
  belongsToProfile(postId: string, profileId: string): Promise<boolean>;
};

export type ProductWriteRepository = {
  /** Create a product and tag it to the post in one step. */
  createTagged(product: {
    profileId: string;
    postId: string;
    title: string;
    affiliateUrl: string;
    imageUrl: string | null;
    priceCents: number | null;
    currency: string;
  }): Promise<{ id: string }>;
  updateAffiliateUrl(productId: string, affiliateUrl: string): Promise<void>;
  remove(productId: string): Promise<void>;
};

/**
 * External gateway: "Plugfolio grabs the image, title, and price" from a
 * pasted product URL. Null when the page can't be read — the service falls
 * back rather than failing the tag.
 */
export type ProductMetadata = {
  readonly title: string | null;
  readonly imageUrl: string | null;
  readonly priceCents: number | null;
  readonly currency: string | null;
};

export type ProductMetadataGateway = {
  fetchMetadata(url: string): Promise<ProductMetadata | null>;
};
