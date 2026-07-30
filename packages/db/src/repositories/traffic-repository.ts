import type { TrafficReadRepository, TrafficSummary } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/**
 * Prisma implementation of the Traffic projection (§6.6): grouped counts over
 * the append-only View, Tap and CodeCopy event tables, joined with display
 * info. Rebuildable by construction — no stored counters anywhere.
 */
export function createTrafficRepository(db: PrismaClient = prisma): TrafficReadRepository {
  return {
    async summarize(profileId: string): Promise<TrafficSummary> {
      const [
        totalViews,
        totalTaps,
        totalCodeCopies,
        postViewGroups,
        postTapGroups,
        productViewGroups,
        productTapGroups,
        copyGroups,
      ] = await Promise.all([
        db.view.count({ where: { profileId } }),
        db.tap.count({ where: { profileId } }),
        db.codeCopy.count({ where: { profileId } }),
        db.view.groupBy({
          by: ["postId"],
          where: { profileId, postId: { isSet: true, not: null } },
          _count: { _all: true },
        }),
        db.tap.groupBy({
          by: ["postId"],
          where: { profileId, postId: { isSet: true, not: null } },
          _count: { _all: true },
        }),
        db.view.groupBy({
          by: ["productId"],
          where: { profileId, productId: { isSet: true, not: null } },
          _count: { _all: true },
        }),
        db.tap.groupBy({
          by: ["productId"],
          where: { profileId },
          _count: { _all: true },
        }),
        db.codeCopy.groupBy({
          by: ["productId"],
          where: { profileId },
          _count: { _all: true },
        }),
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

      return { totalViews, totalTaps, totalCodeCopies, byPost, byProduct, byCode };
    },
  };
}
