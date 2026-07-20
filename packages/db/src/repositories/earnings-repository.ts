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
      const [totalTaps, postGroups, productGroups] = await Promise.all([
        db.tap.count({ where: { profileId } }),
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
      ]);

      const [posts, products] = await Promise.all([
        db.post.findMany({
          where: { id: { in: postGroups.map((g) => g.postId!) } },
          select: { id: true, mediaUrl: true, caption: true },
        }),
        db.product.findMany({
          where: { id: { in: productGroups.map((g) => g.productId) } },
          select: { id: true, title: true },
        }),
      ]);
      const postById = new Map(posts.map((p) => [p.id, p]));
      const productById = new Map(products.map((p) => [p.id, p]));

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

      const byProduct = productGroups
        .flatMap((g) => {
          const product = productById.get(g.productId);
          return product ? [{ productId: product.id, title: product.title, taps: g._count._all }] : [];
        })
        .sort((a, b) => b.taps - a.taps);

      return { totalTaps, byPost, byProduct };
    },
  };
}
