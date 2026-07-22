/**
 * Read port for the attribution-relevant slice of a product. The service uses
 * this to derive `profileId` from the product itself (§6.6), rather than
 * trusting a client-supplied profile. The Prisma implementation lives in
 * `@plugfolio/db`.
 */
export type ProductForAttribution = {
  readonly id: string;
  readonly profileId: string;
  /** Null = in-store-only coupon (ADR-0011): no outbound destination, so no taps. */
  readonly affiliateUrl: string | null;
  /** Copies are only valid on products that actually carry a code. */
  readonly couponCode: string | null;
};

export type ProductReadRepository = {
  findForAttribution(productId: string): Promise<ProductForAttribution | null>;
  /**
   * Whether `postId` actually has `productId` tagged — guards per-post
   * attribution so a client can't file taps under an unrelated post.
   */
  isTaggedToPost(productId: string, postId: string): Promise<boolean>;
};
