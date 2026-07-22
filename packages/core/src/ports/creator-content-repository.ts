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
  /** Put the post on a shelf, or take it off (null) — ADR-0010. */
  setCategory(postId: string, categoryId: string | null): Promise<void>;
};

export type ProductWriteRepository = {
  /** Create a product and tag it to the post in one step. */
  createTagged(product: {
    profileId: string;
    postId: string;
    kind: "affiliate" | "own";
    title: string;
    affiliateUrl: string | null;
    couponCode: string | null;
    offerEndsAt: Date | null;
    inStoreNote: string | null;
    imageUrl: string | null;
    priceCents: number | null;
    currency: string;
  }): Promise<{ id: string }>;
  updateAffiliateUrl(productId: string, affiliateUrl: string): Promise<void>;
  /** Set or clear (all-null) the coupon attachment — ADR-0011. */
  updateCoupon(
    productId: string,
    coupon: { couponCode: string | null; offerEndsAt: Date | null; inStoreNote: string | null },
  ): Promise<void>;
  /** Put the product on a shelf, or take it off (null) — ADR-0010. */
  setCategory(productId: string, categoryId: string | null): Promise<void>;
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
