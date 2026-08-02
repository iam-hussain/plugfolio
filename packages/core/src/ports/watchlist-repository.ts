import type { WatchKind } from "../schemas/watchlist";

/**
 * Port for a shopper's watchlist — saved posts and products. Writes are
 * idempotent the way follows are: saving twice or removing something never
 * saved is a no-op, not an error (§6.8, in-app browsers double-fire).
 */

/**
 * One saved row, already joined to the thing it points at and the creator who
 * tagged it. A product carries its price and offer; a post carries neither, so
 * both render in the same grid without the page branching on kind.
 */
export type WatchlistItem = {
  readonly kind: WatchKind;
  /** The post or product id — with `kind`, the route out. */
  readonly id: string;
  readonly savedAt: Date;
  readonly title: string;
  readonly imageUrl: string | null;
  /** Product only; null on a post, and never a zero for "unknown". */
  readonly priceCents: number | null;
  readonly currency: string | null;
  readonly couponCode: string | null;
  readonly offerEndsAt: Date | null;
  /** Product only: "affiliate" | "own". */
  readonly productKind: string | null;
  readonly creator: {
    readonly username: string;
    readonly displayName: string | null;
    readonly avatarUrl: string | null;
  };
};

export type WatchlistRepository = {
  add(userId: string, kind: WatchKind, targetId: string): Promise<void>;
  remove(userId: string, kind: WatchKind, targetId: string): Promise<void>;
  isWatched(userId: string, kind: WatchKind, targetId: string): Promise<boolean>;
  /** Does the post/product exist and is it publicly visible? */
  targetExists(kind: WatchKind, targetId: string): Promise<boolean>;
  /**
   * The whole list, newest save first. Rows whose target has since been
   * deleted, hidden or suspended are dropped here — the list only shows doors
   * that open.
   *
   * ponytail: unpaged, because a watchlist is tens of rows. If someone saves
   * thousands, push the slice down here.
   */
  listByUser(userId: string): Promise<readonly WatchlistItem[]>;
};
