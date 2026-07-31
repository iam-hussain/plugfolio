/**
 * Read port for the no-login shopper surface (ADR-0002): the creator page,
 * post view, and product page. Read models carry exactly what those screens
 * render — nothing account- or dashboard-shaped. Prisma implementation lives
 * in `@plugfolio/db` (§6.2).
 */

import type { PageAccent, PageGridStyle, PageHeaderStyle } from "../schemas/page-appearance";

export type ShopperProduct = {
  readonly id: string;
  readonly title: string;
  readonly imageUrl: string | null;
  /** Display-only price grabbed at tag time; the retailer owns the real price. */
  readonly priceCents: number | null;
  readonly currency: string;
  /** ADR-0011: affiliate (Buy → retailer) or own (Shop their store). */
  readonly kind: "affiliate" | "own";
  /** Outbound destination; null = in-store-only coupon → no Buy button. */
  readonly affiliateUrl: string | null;
  /** Coupon attachment (ADR-0011); all null when the product carries no offer. */
  readonly couponCode: string | null;
  readonly offerEndsAt: Date | null;
  readonly inStoreNote: string | null;
  /** The shelf it sits in (ADR-0010); null = uncategorized ("All" only). */
  readonly categoryId: string | null;
};

export type MediaKind = "still" | "youtube" | "instagram" | "tiktok";

export type ShopperPost = {
  readonly id: string;
  /** The still, or the poster frame for a video (ADR-0019). Always present. */
  readonly mediaUrl: string;
  /** What the post IS; resolved past the default, so `still` is explicit. */
  readonly mediaKind: MediaKind;
  /** The provider's embed URL — never rendered until the shopper presses play. */
  readonly embedUrl: string | null;
  /** Where the video lives publicly; the always-present way out. */
  readonly sourceUrl: string | null;
  readonly caption: string | null;
  readonly categoryId: string | null;
  /** Hidden by the creator (brief 07): public surfaces filter these out;
   * the dashboard shows them with a "hidden" chip. */
  readonly hiddenAt: Date | null;
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
  /** Public identity (brief 10); null = show @username / an initial tile. */
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly bio: string | null;
  /** One line above the name (ADR-0017); null = none. */
  readonly greeting: string | null;
  /** How the page looks (ADR-0017) — already resolved past the defaults, so
   *  no component has to know what a default is. */
  readonly accent: PageAccent;
  readonly headerStyle: PageHeaderStyle;
  readonly gridStyle: PageGridStyle;
  readonly followerCount: number;
  readonly categories: readonly PageCategory[];
  readonly posts: readonly ShopperPost[];
};

export type ShopperProductView = ShopperProduct & {
  /** The owning profile — the product page's comment target (ADR-0013). */
  readonly profileId: string;
  /** The post it came from (brief 03); null if tagged nowhere yet. */
  readonly fromPost: { readonly id: string; readonly mediaUrl: string } | null;
};

/**
 * The creator's Products tab row: the product, how many posts use it, and the
 * page it was read from. `sourceUrl` is creator-only — a shopper is shown the
 * outbound link, never where the metadata came from.
 */
export type CreatorProductRow = ShopperProduct & {
  readonly postCount: number;
  readonly sourceUrl: string | null;
};

export type CreatorPageReadRepository = {
  findByUsername(username: string): Promise<CreatorPage | null>;
  /** Every product of the profile — including ones whose post was deleted. */
  listProducts(username: string): Promise<readonly CreatorProductRow[]>;
  /** Scoped by username so a post can't be reached under another creator's handle. */
  findPost(username: string, postId: string): Promise<ShopperPost | null>;
  findProduct(username: string, productId: string): Promise<ShopperProductView | null>;
};
