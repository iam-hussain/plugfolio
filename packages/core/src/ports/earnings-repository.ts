/**
 * Read port for the Earnings projection (§6.6): a rebuildable aggregation over
 * the append-only Tap event table — never a mutated counter. Every number here
 * is TRACKED (directly measured outbound taps); "estimated" conversion figures
 * join the model only when an affiliate network reports data back — v1 has no
 * such source, so the read model doesn't pretend to.
 */

export type PostTapCount = {
  readonly postId: string;
  readonly mediaUrl: string;
  readonly caption: string | null;
  /** "This reel drove 312 taps." */
  readonly taps: number;
};

export type ProductTapCount = {
  readonly productId: string;
  readonly title: string;
  readonly taps: number;
};

export type EarningsSummary = {
  /** Every outbound tap for the profile, including post-less surface taps. */
  readonly totalTaps: number;
  /** Ordered most-tapped first. Taps whose post was deleted count only in totals. */
  readonly byPost: readonly PostTapCount[];
  readonly byProduct: readonly ProductTapCount[];
};

export type EarningsReadRepository = {
  summarize(profileId: string): Promise<EarningsSummary>;
};
