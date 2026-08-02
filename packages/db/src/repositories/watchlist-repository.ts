import type { WatchKind, WatchlistItem, WatchlistRepository } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/**
 * Prisma implementation of the `WatchlistRepository` port. Idempotency comes
 * from the `[userId, kind, targetId]` unique index: upsert absorbs a
 * double-fired save, deleteMany absorbs removing a row that's already gone.
 *
 * The rows are polymorphic (see the schema note on `Watch`), so the read
 * fetches the two kinds separately and re-joins them in saved order — two
 * queries for the whole list, not one per row.
 */
export function createWatchlistRepository(db: PrismaClient = prisma): WatchlistRepository {
  return {
    async add(userId: string, kind: WatchKind, targetId: string): Promise<void> {
      await db.watch.upsert({
        where: { userId_kind_targetId: { userId, kind, targetId } },
        update: {},
        create: { userId, kind, targetId },
      });
    },

    async remove(userId: string, kind: WatchKind, targetId: string): Promise<void> {
      await db.watch.deleteMany({ where: { userId, kind, targetId } });
    },

    async isWatched(userId: string, kind: WatchKind, targetId: string): Promise<boolean> {
      const count = await db.watch.count({ where: { userId, kind, targetId } });
      return count > 0;
    },

    async targetExists(kind: WatchKind, targetId: string): Promise<boolean> {
      // Same visibility rule as the list below: you can only save what a
      // shopper can actually open.
      const count =
        kind === "post"
          ? await db.post.count({
              where: {
                id: targetId,
                hiddenAt: { isSet: false },
                profile: { suspendedAt: { isSet: false } },
              },
            })
          : await db.product.count({
              where: { id: targetId, profile: { suspendedAt: { isSet: false } } },
            });
      return count > 0;
    },

    async listByUser(userId: string): Promise<readonly WatchlistItem[]> {
      const rows = await db.watch.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { kind: true, targetId: true, createdAt: true },
      });
      if (rows.length === 0) return [];

      const creator = {
        select: { username: true, displayName: true, avatarUrl: true, suspendedAt: true },
      };
      const [posts, products] = await Promise.all([
        db.post.findMany({
          where: {
            id: { in: rows.filter((row) => row.kind === "post").map((row) => row.targetId) },
            hiddenAt: { isSet: false },
          },
          select: { id: true, caption: true, mediaUrl: true, profile: creator },
        }),
        db.product.findMany({
          where: {
            id: { in: rows.filter((row) => row.kind === "product").map((row) => row.targetId) },
          },
          select: {
            id: true,
            title: true,
            imageUrl: true,
            priceCents: true,
            currency: true,
            couponCode: true,
            offerEndsAt: true,
            kind: true,
            profile: creator,
          },
        }),
      ]);

      const byKey = new Map<string, WatchlistItem>();
      for (const post of posts) {
        if (post.profile.suspendedAt) continue;
        byKey.set(`post:${post.id}`, {
          kind: "post",
          id: post.id,
          savedAt: new Date(0), // replaced below, from the saving row
          title: post.caption ?? "Post",
          imageUrl: post.mediaUrl,
          priceCents: null,
          currency: null,
          couponCode: null,
          offerEndsAt: null,
          productKind: null,
          creator: post.profile,
        });
      }
      for (const product of products) {
        if (product.profile.suspendedAt) continue;
        byKey.set(`product:${product.id}`, {
          kind: "product",
          id: product.id,
          savedAt: new Date(0),
          title: product.title,
          imageUrl: product.imageUrl,
          priceCents: product.priceCents,
          currency: product.currency,
          couponCode: product.couponCode,
          offerEndsAt: product.offerEndsAt,
          productKind: product.kind,
          creator: product.profile,
        });
      }

      // Saved order, and rows whose target has gone (deleted, hidden,
      // suspended) simply fall out — the list only shows doors that open.
      return rows.flatMap((row) => {
        const item = byKey.get(`${row.kind}:${row.targetId}`);
        return item ? [{ ...item, savedAt: row.createdAt }] : [];
      });
    },
  };
}
