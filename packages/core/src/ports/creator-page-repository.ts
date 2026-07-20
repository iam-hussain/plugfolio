/**
 * Read port for the no-login shopper surface (ADR-0002): the creator page,
 * post view, and product page. Read models carry exactly what those screens
 * render — nothing account- or dashboard-shaped. Prisma implementation lives
 * in `@plugfolio/db` (§6.2).
 */

export type ShopperProduct = {
  readonly id: string;
  readonly title: string;
  readonly imageUrl: string | null;
  /** Display-only price grabbed at tag time; the retailer owns the real price. */
  readonly priceCents: number | null;
  readonly currency: string;
  readonly affiliateUrl: string;
};

export type ShopperPost = {
  readonly id: string;
  readonly mediaUrl: string;
  readonly caption: string | null;
  readonly products: readonly ShopperProduct[];
};

export type CreatorPage = {
  readonly id: string;
  readonly username: string;
  readonly posts: readonly ShopperPost[];
};

export type ShopperProductView = ShopperProduct & {
  /** The post it came from (brief 03); null if tagged nowhere yet. */
  readonly fromPost: { readonly id: string; readonly mediaUrl: string } | null;
};

export type CreatorPageReadRepository = {
  findByUsername(username: string): Promise<CreatorPage | null>;
  /** Scoped by username so a post can't be reached under another creator's handle. */
  findPost(username: string, postId: string): Promise<ShopperPost | null>;
  findProduct(username: string, productId: string): Promise<ShopperProductView | null>;
};
