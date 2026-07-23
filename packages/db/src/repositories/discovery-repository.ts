import type {
  DiscoveryCreator,
  DiscoveryProduct,
  DiscoveryReadRepository,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Suspended profiles/accounts never surface on Explore (admin-app note). */
const liveProfile = { suspendedAt: null, user: { suspendedAt: null } } as const;

/**
 * Prisma implementation of the `DiscoveryReadRepository` port — the public
 * Explore surface's read side. Counts come from relation `_count`; the card
 * thumbnail is the creator's latest post media.
 */
export function createDiscoveryRepository(db: PrismaClient = prisma): DiscoveryReadRepository {
  return {
    async listCreators(query: string, limit: number): Promise<readonly DiscoveryCreator[]> {
      const rows = await db.profile.findMany({
        where: {
          ...liveProfile,
          ...(query ? { username: { contains: query, mode: "insensitive" } } : undefined),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          username: true,
          _count: { select: { followers: true, posts: true, products: true } },
          posts: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { mediaUrl: true },
          },
        },
      });
      return rows.map((row) => ({
        id: row.id,
        username: row.username,
        followerCount: row._count.followers,
        postCount: row._count.posts,
        productCount: row._count.products,
        latestMediaUrl: row.posts[0]?.mediaUrl ?? null,
      }));
    },

    async listProducts(query: string, limit: number): Promise<readonly DiscoveryProduct[]> {
      const rows = await db.product.findMany({
        where: {
          profile: liveProfile,
          ...(query ? { title: { contains: query, mode: "insensitive" } } : undefined),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          imageUrl: true,
          priceCents: true,
          currency: true,
          kind: true,
          affiliateUrl: true,
          couponCode: true,
          offerEndsAt: true,
          inStoreNote: true,
          categoryId: true,
          profile: { select: { username: true } },
        },
      });
      return rows.map(({ profile, ...product }) => ({ ...product, username: profile.username }));
    },
  };
}
