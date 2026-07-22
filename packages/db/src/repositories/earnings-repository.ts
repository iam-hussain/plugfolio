import type { EarningsReadRepository, EarningsSummary } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/**
 * Prisma implementation of the Earnings projection (§6.6): grouped counts over
 * the append-only Tap event table, joined with display info. Rebuildable by
 * construction — no stored counters anywhere.
 */
export function createEarningsRepository(db: PrismaClient = prisma): EarningsReadRepository {
  return {
    async summarize(profileId: string): Promise<EarningsSummary> {
      const [totalTaps, totalCodeCopies, postGroups, productGroups, copyGroups] =
        await Promise.all([
          db.tap.count({ where: { profileId } }),
          db.codeCopy.count({ where: { profileId } }),
          db.tap.groupBy({
            by: ["postId"],
            where: { profileId, postId: { not: null } },
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

      const copiesByProduct = new Map(copyGroups.map((g) => [g.productId, g._count._all]));
      // A product can have copies but no taps (in-store-only coupons) — it
      // still deserves a row.
      const productIds = [
        ...new Set([...productGroups.map((g) => g.productId), ...copiesByProduct.keys()]),
      ];

      const [posts, products] = await Promise.all([
        db.post.findMany({
          where: { id: { in: postGroups.map((g) => g.postId!) } },
          select: { id: true, mediaUrl: true, caption: true },
        }),
        db.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, title: true },
        }),
      ]);
      const postById = new Map(posts.map((p) => [p.id, p]));
      const productById = new Map(products.map((p) => [p.id, p]));
      const tapsByProduct = new Map(productGroups.map((g) => [g.productId, g._count._all]));

      const byPost = postGroups
        // A post deleted after its taps were recorded (postId kept via SetNull
        // then the row pruned) has no display row; its taps stay in totals.
        .flatMap((g) => {
          const post = postById.get(g.postId!);
          return post
            ? [{ postId: post.id, mediaUrl: post.mediaUrl, caption: post.caption, taps: g._count._all }]
            : [];
        })
        .sort((a, b) => b.taps - a.taps);

      const byProduct = productIds
        .flatMap((productId) => {
          const product = productById.get(productId);
          return product
            ? [
                {
                  productId: product.id,
                  title: product.title,
                  taps: tapsByProduct.get(productId) ?? 0,
                  codeCopies: copiesByProduct.get(productId) ?? 0,
                },
              ]
            : [];
        })
        .sort((a, b) => b.taps - a.taps || b.codeCopies - a.codeCopies);

      return { totalTaps, totalCodeCopies, byPost, byProduct };
    },
  };
}
