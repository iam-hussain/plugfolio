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
  /** The shelf it sits in (ADR-0010); null = uncategorized ("All" only). */
  readonly categoryId: string | null;
};

export type ShopperPost = {
  readonly id: string;
  readonly mediaUrl: string;
  readonly caption: string | null;
  readonly categoryId: string | null;
  readonly products: readonly ShopperProduct[];
};

/** A category chip on the public page (ADR-0010). */
export type PageCategory = {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
};

export type CreatorPage = {
  readonly id: string;
  readonly username: string;
  readonly categories: readonly PageCategory[];
  readonly posts: readonly ShopperPost[];
};

export type ShopperProductView = ShopperProduct & {
  /** The post it came from (brief 03); null if tagged nowhere yet. */
  readonly fromPost: { readonly id: string; readonly mediaUrl: string } | null;
};

export type CreatorPageReadRepository = {
  findByUsername(username: string): Promise<CreatorPage | null>;
  /** Every product of the profile — including ones whose post was deleted. */
  listProducts(username: string): Promise<readonly ShopperProduct[]>;
  /** Scoped by username so a post can't be reached under another creator's handle. */
  findPost(username: string, postId: string): Promise<ShopperPost | null>;
  findProduct(username: string, productId: string): Promise<ShopperProductView | null>;
};
