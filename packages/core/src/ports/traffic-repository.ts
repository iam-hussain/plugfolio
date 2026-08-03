/**
 * Read port for the Traffic projection (§6.6): a rebuildable aggregation over
 * the append-only View, Tap and CodeCopy event tables — never a mutated
 * counter.
 *
 * Called "Earnings" until it was pointed out that it earns nothing. Plugfolio
 * handles no money and sees no sale (§2.3), so the word promised a number this
 * product cannot produce. What it actually holds is measured counts: who
 * looked, and who left for a retailer.
 *
 * Every number here is TRACKED. "Estimated" conversion figures join the model
 * only when an affiliate network reports data back — v1 has no such source, so
 * the read model doesn't pretend to.
 */

export type PostTraffic = {
  readonly postId: string;
  readonly mediaUrl: string;
  readonly caption: string | null;
  /** The post page opening. */
  readonly views: number;
  /** "This reel drove 312 taps." */
  readonly taps: number;
};

export type ProductTraffic = {
  readonly productId: string;
  readonly title: string;
  readonly views: number;
  readonly taps: number;
  /** Coupon-code copies (ADR-0011) — measured copies, never redemptions. */
  readonly codeCopies: number;
};

/** A code with its copies, for the "redemption not tracked" list. */
export type CodeCopyCount = {
  readonly productId: string;
  readonly title: string;
  readonly couponCode: string;
  /** In-store-only coupons have no link to tap — the list says so. */
  readonly inStoreOnly: boolean;
  readonly copies: number;
};

/** The window a creator reads Traffic over (v2, ADR-0026). */
export type TrafficRange = "today" | "week" | "month" | "year" | "all";

/** One bar pair in the views-vs-taps chart. `label` is pre-formatted. */
export type TrafficBucket = {
  readonly label: string;
  readonly views: number;
  readonly taps: number;
};

/** Views by the referrer that brought them, classified into named sources. */
export type TrafficSource = {
  readonly source: string;
  readonly views: number;
};

export type TrafficSummary = {
  /** Every view of the profile's page, posts and product pages. */
  readonly totalViews: number;
  /** Every outbound tap for the profile, including post-less surface taps. */
  readonly totalTaps: number;
  /** Every coupon-code copy — labeled "redemption not tracked" at the view. */
  readonly totalCodeCopies: number;
  /** Ordered most-tapped first. Events whose post was deleted count only in totals. */
  readonly byPost: readonly PostTraffic[];
  readonly byProduct: readonly ProductTraffic[];
  readonly byCode: readonly CodeCopyCount[];
  /** Views split by what was opened: the page, a post, a thing. */
  readonly viewsBySurface: {
    readonly profile: number;
    readonly post: number;
    readonly product: number;
  };
  /** The chart's bar pairs, oldest first. Empty when nothing was measured. */
  readonly series: readonly TrafficBucket[];
  /** Views by named source, most-viewed first. Views recorded before the
      referrer existed land in "Typed or unknown" — never guessed at. */
  readonly sources: readonly TrafficSource[];
};

export type SummarizeOptions = {
  /** Only events at/after this instant; omit for all time. */
  readonly since?: Date | null;
  /** The chart's granularity; the service picks it from the range. */
  readonly bucket?: "hour" | "day" | "month";
  /** Injected clock, so bucketing is testable. */
  readonly now?: Date;
};

export type TrafficReadRepository = {
  summarize(profileId: string, options?: SummarizeOptions): Promise<TrafficSummary>;
};
