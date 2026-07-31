/**
 * Ports for the creator's back room (lean journey: Posts + Products tabs).
 * Writes only — the dashboard reads reuse the shopper read models, which
 * already carry everything the tabs render.
 */

/** Whether the user has ANY connected social (ADR-0004: a profile needs one). */
export type ConnectionReadRepository = {
  hasAny(userId: string): Promise<boolean>;
};

/** The post's media + words, shared by create and update (ADR-0019). */
export type PostContent = {
  readonly mediaUrl: string;
  readonly mediaKind: string;
  readonly embedUrl: string | null;
  readonly sourceUrl: string | null;
  readonly caption: string | null;
  readonly categoryId: string | null;
};

export type PostWriteRepository = {
  create(post: PostContent & { profileId: string }): Promise<{ id: string }>;
  /** Edit everything about a post except which profile it belongs to. */
  update(postId: string, post: PostContent): Promise<void>;
  belongsToProfile(postId: string, profileId: string): Promise<boolean>;
  /** Put the post on a shelf, or take it off (null) — ADR-0010. */
  setCategory(postId: string, categoryId: string | null): Promise<void>;
  /** Hide from / restore to the public page (brief 07). */
  setHidden(postId: string, hidden: boolean): Promise<void>;
};

export type NewProduct = {
  readonly profileId: string;
  readonly kind: "affiliate" | "own";
  readonly title: string;
  readonly sourceUrl: string;
  readonly affiliateUrl: string | null;
  readonly couponCode: string | null;
  readonly offerEndsAt: Date | null;
  readonly inStoreNote: string | null;
  readonly imageUrl: string | null;
  readonly priceCents: number | null;
  readonly currency: string;
  readonly categoryId: string | null;
};

export type ProductWriteRepository = {
  /** Create a product and tag it to the post in one step. */
  createTagged(product: NewProduct & { postId: string }): Promise<{ id: string }>;
  /** Create a product with no post — the library is a real place (§5.21). */
  create(product: NewProduct): Promise<{ id: string }>;
  /** Edit the product itself: where it came from, whose it is, where it goes. */
  update(
    productId: string,
    patch: {
      sourceUrl?: string;
      kind?: "affiliate" | "own";
      affiliateUrl?: string | null;
      title?: string;
      imageUrl?: string | null;
      priceCents?: number | null;
      currency?: string;
    },
  ): Promise<void>;
  /** Connect / disconnect an existing product. Copies nothing — it's one row. */
  connectToPost(productId: string, postId: string): Promise<void>;
  disconnectFromPost(productId: string, postId: string): Promise<void>;
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
