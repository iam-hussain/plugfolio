/**
 * Read port for the attribution-relevant slice of a product. The service uses
 * this to derive `profileId` from the product itself (§6.6), rather than
 * trusting a client-supplied profile. The Prisma implementation lives in
 * `@plugfolio/db`.
 */
export type ProductForAttribution = {
  readonly id: string;
  readonly profileId: string;
};

export type ProductReadRepository = {
  findForAttribution(productId: string): Promise<ProductForAttribution | null>;
};
