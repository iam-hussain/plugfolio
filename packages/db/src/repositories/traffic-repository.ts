import {
  classifyReferrer,
  type SummarizeOptions,
  type TrafficBucket,
  type TrafficReadRepository,
  type TrafficSummary,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

const hourLabel = new Intl.DateTimeFormat("en", { hour: "2-digit", hour12: false });
const dayLabel = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });
const monthLabel = new Intl.DateTimeFormat("en", { month: "short" });

/** The chart's bucket key for an instant, at the requested granularity. */
function bucketKey(at: Date, bucket: "hour" | "day" | "month"): number {
  const d = new Date(at);
  if (bucket === "hour") d.setMinutes(0, 0, 0);
  else if (bucket === "day") d.setHours(0, 0, 0, 0);
  else {
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
  }
  return d.getTime();
}

function bucketLabel(key: number, bucket: "hour" | "day" | "month"): string {
  const d = new Date(key);
  return bucket === "hour" ? hourLabel.format(d) : bucket === "day" ? dayLabel.format(d) : monthLabel.format(d);
}

function nextKey(key: number, bucket: "hour" | "day" | "month"): number {
  const d = new Date(key);
  if (bucket === "hour") d.setHours(d.getHours() + 1);
  else if (bucket === "day") d.setDate(d.getDate() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.getTime();
}

/** Continuous bar pairs from since→now — an empty hour is a 0-height bar,
    never a missing one, so the axis keeps honest time. */
function buildSeries(
  views: readonly Date[],
  taps: readonly Date[],
  since: Date | null,
  now: Date,
  bucket: "hour" | "day" | "month",
): TrafficBucket[] {
  const all = [...views, ...taps];
  if (all.length === 0) return [];
  const start = since ?? new Date(Math.min(...all.map((d) => d.getTime())));
  const viewCounts = new Map<number, number>();
  const tapCounts = new Map<number, number>();
  for (const at of views) {
    const key = bucketKey(at, bucket);
    viewCounts.set(key, (viewCounts.get(key) ?? 0) + 1);
  }
  for (const at of taps) {
    const key = bucketKey(at, bucket);
    tapCounts.set(key, (tapCounts.get(key) ?? 0) + 1);
  }
  const series: TrafficBucket[] = [];
  const end = bucketKey(now, bucket);
  // ponytail: capped at 60 bars — an "all time" span longer than that gets its
  // tail truncated from the left rather than an unreadable chart.
  for (
    let key = bucketKey(start, bucket);
    key <= end && series.length < 60;
    key = nextKey(key, bucket)
  ) {
    series.push({
      label: bucketLabel(key, bucket),
      views: viewCounts.get(key) ?? 0,
      taps: tapCounts.get(key) ?? 0,
    });
  }
  return series;
}

/**
 * Prisma implementation of the Traffic projection (§6.6): grouped counts over
 * the append-only View, Tap and CodeCopy event tables, joined with display
 * info. Rebuildable by construction — no stored counters anywhere.
 */
export function createTrafficRepository(db: PrismaClient = prisma): TrafficReadRepository {
  return {
    async summarize(profileId: string, options?: SummarizeOptions): Promise<TrafficSummary> {
      const since = options?.since ?? null;
      const bucket = options?.bucket ?? "day";
      const now = options?.now ?? new Date();
      const inRange = since ? { occurredAt: { gte: since } } : {};
      const [
        totalViews,
        totalTaps,
        totalCodeCopies,
        postViewGroups,
        postTapGroups,
        productViewGroups,
        productTapGroups,
        copyGroups,
        surfaceGroups,
        referrerGroups,
        viewTimes,
        tapTimes,
      ] = await Promise.all([
        db.view.count({ where: { profileId, ...inRange } }),
        db.tap.count({ where: { profileId, ...inRange } }),
        db.codeCopy.count({ where: { profileId, ...inRange } }),
        db.view.groupBy({
          by: ["postId"],
          where: { profileId, postId: { isSet: true, not: null }, ...inRange },
          _count: { _all: true },
        }),
        db.tap.groupBy({
          by: ["postId"],
          where: { profileId, postId: { isSet: true, not: null }, ...inRange },
          _count: { _all: true },
        }),
        db.view.groupBy({
          by: ["productId"],
          where: { profileId, productId: { isSet: true, not: null }, ...inRange },
          _count: { _all: true },
        }),
        db.tap.groupBy({
          by: ["productId"],
          where: { profileId, ...inRange },
          _count: { _all: true },
        }),
        db.codeCopy.groupBy({
          by: ["productId"],
          where: { profileId, ...inRange },
          _count: { _all: true },
        }),
        db.view.groupBy({
          by: ["surface"],
          where: { profileId, ...inRange },
          _count: { _all: true },
        }),
        db.view.groupBy({
          by: ["referrer"],
          where: { profileId, ...inRange },
          _count: { _all: true },
        }),
        // ponytail: the chart buckets in JS from bare timestamps — fine at v1
        // scale; switch to an aggregation pipeline if profiles pass ~100k
        // events per read.
        db.view.findMany({ where: { profileId, ...inRange }, select: { occurredAt: true } }),
        db.tap.findMany({ where: { profileId, ...inRange }, select: { occurredAt: true } }),
      ]);

      const viewsByPost = new Map(postViewGroups.map((g) => [g.postId!, g._count._all]));
      const tapsByPost = new Map(postTapGroups.map((g) => [g.postId!, g._count._all]));
      const viewsByProduct = new Map(productViewGroups.map((g) => [g.productId!, g._count._all]));
      const tapsByProduct = new Map(productTapGroups.map((g) => [g.productId, g._count._all]));
      const copiesByProduct = new Map(copyGroups.map((g) => [g.productId, g._count._all]));

      // A post can be viewed without being tapped, and a product can have
      // copies but no taps (in-store-only coupons) — each still deserves a row.
      const postIds = [...new Set([...viewsByPost.keys(), ...tapsByPost.keys()])];
      const productIds = [
        ...new Set([...viewsByProduct.keys(), ...tapsByProduct.keys(), ...copiesByProduct.keys()]),
      ];

      const [posts, products] = await Promise.all([
        db.post.findMany({
          where: { id: { in: postIds } },
          select: { id: true, mediaUrl: true, caption: true },
        }),
        db.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, title: true, couponCode: true, affiliateUrl: true },
        }),
      ]);
      const postById = new Map(posts.map((p) => [p.id, p]));
      const productById = new Map(products.map((p) => [p.id, p]));

      const byPost = postIds
        // A post deleted after its events were recorded (the id kept via
        // SetNull, then the row pruned) has no display row; its counts stay in
        // the totals.
        .flatMap((postId) => {
          const post = postById.get(postId);
          return post
            ? [
                {
                  postId: post.id,
                  mediaUrl: post.mediaUrl,
                  caption: post.caption,
                  views: viewsByPost.get(postId) ?? 0,
                  taps: tapsByPost.get(postId) ?? 0,
                },
              ]
            : [];
        })
        .sort((a, b) => b.taps - a.taps || b.views - a.views);

      const byProduct = productIds
        .flatMap((productId) => {
          const product = productById.get(productId);
          return product
            ? [
                {
                  productId: product.id,
                  title: product.title,
                  views: viewsByProduct.get(productId) ?? 0,
                  taps: tapsByProduct.get(productId) ?? 0,
                  codeCopies: copiesByProduct.get(productId) ?? 0,
                },
              ]
            : [];
        })
        .sort((a, b) => b.taps - a.taps || b.codeCopies - a.codeCopies);

      const byCode = [...copiesByProduct.entries()]
        .flatMap(([productId, copies]) => {
          const product = productById.get(productId);
          // A code cleared after its copies were recorded has no code to name.
          return product?.couponCode
            ? [
                {
                  productId: product.id,
                  title: product.title,
                  couponCode: product.couponCode,
                  inStoreOnly: !product.affiliateUrl,
                  copies,
                },
              ]
            : [];
        })
        .sort((a, b) => b.copies - a.copies);

      const surfaceCount = new Map(surfaceGroups.map((g) => [g.surface, g._count._all]));
      const viewsBySurface = {
        profile: surfaceCount.get("profile") ?? 0,
        post: surfaceCount.get("post") ?? 0,
        product: surfaceCount.get("product") ?? 0,
      };

      // Referrers → named sources; several referrers can fold into one name.
      const sourceCounts = new Map<string, number>();
      for (const group of referrerGroups) {
        const name = classifyReferrer(group.referrer ?? null);
        sourceCounts.set(name, (sourceCounts.get(name) ?? 0) + group._count._all);
      }
      const sources = [...sourceCounts.entries()]
        .map(([source, views]) => ({ source, views }))
        .sort((a, b) => b.views - a.views);

      const series = buildSeries(
        viewTimes.map((v) => v.occurredAt),
        tapTimes.map((t) => t.occurredAt),
        since,
        now,
        bucket,
      );

      return {
        totalViews,
        totalTaps,
        totalCodeCopies,
        byPost,
        byProduct,
        byCode,
        viewsBySurface,
        series,
        sources,
      };
    },
  };
}
