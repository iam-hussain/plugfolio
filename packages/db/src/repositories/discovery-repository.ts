import type {
  DiscoveryCreator,
  DiscoveryPost,
  DiscoveryProduct,
  DiscoveryReadRepository,
  SitemapCreator,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";
import { liveProfile, notHidden } from "./visibility";

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
          displayName: true,
          avatarUrl: true,
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
        displayName: row.displayName,
        avatarUrl: row.avatarUrl,
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
          profile: { select: { username: true, avatarUrl: true } },
        },
      });
      return rows.map(({ profile, ...product }) => ({
        ...product,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
      }));
    },

    async listPosts(query: string, limit: number): Promise<readonly DiscoveryPost[]> {
      // Filtering the to-one `profile` relation inside an OR makes Prisma emit a
      // Mongo aggregation that `$size`s a null lookup and crashes the whole
      // query. Resolve matching usernames to ids first, then match posts on the
      // scalar `profileId` — the username lookup is the same one listCreators runs.
      const matchingProfileIds = query
        ? (
            await db.profile.findMany({
              where: { ...liveProfile, username: { contains: query, mode: "insensitive" } },
              select: { id: true },
            })
          ).map((row) => row.id)
        : [];
      const rows = await db.post.findMany({
        where: {
          // AND wrapper: notHidden is an OR, and the query below also spreads
          // an OR — as siblings one key would silently clobber the other.
          AND: [notHidden],
          profile: liveProfile,
          ...(query
            ? {
                OR: [
                  { caption: { contains: query, mode: "insensitive" } },
                  ...(matchingProfileIds.length ? [{ profileId: { in: matchingProfileIds } }] : []),
                ],
              }
            : undefined),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          mediaUrl: true,
          caption: true,
          profile: { select: { username: true, avatarUrl: true } },
          products: {
            select: {
              id: true,
              title: true,
              priceCents: true,
              currency: true,
              kind: true,
              couponCode: true,
              offerEndsAt: true,
            },
          },
        },
      });
      const now = new Date();
      return rows.map((row) => ({
        id: row.id,
        username: row.profile.username,
        avatarUrl: row.profile.avatarUrl,
        mediaUrl: row.mediaUrl,
        caption: row.caption,
        productCount: row.products.length,
        // Only the first three ride the tile; the rest collapse into a "+N" pill.
        tags: row.products.slice(0, 3).map((product) => ({
          productId: product.id,
          name: product.title,
          priceCents: product.priceCents,
          currency: product.currency,
          tone:
            product.couponCode && (!product.offerEndsAt || product.offerEndsAt > now)
              ? ("offer" as const)
              : product.kind === "own"
                ? ("own" as const)
                : ("affiliate" as const),
        })),
      }));
    },

    async listSitemapCreators(limit: number): Promise<readonly SitemapCreator[]> {
      const rows = await db.profile.findMany({
        where: liveProfile,
        orderBy: { createdAt: "asc" },
        take: limit,
        select: {
          username: true,
          posts: { where: notHidden, select: { id: true, createdAt: true } },
          products: { select: { id: true, createdAt: true } },
        },
      });
      return rows;
    },
  };
}
