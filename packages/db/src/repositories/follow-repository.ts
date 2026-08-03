import type { FollowRepository, FollowedCreator, ProfileSummary } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/**
 * Prisma implementation of the `FollowRepository` port. Idempotency via the
 * composite primary key: upsert absorbs double-fired follows, deleteMany
 * absorbs unfollows of rows that are already gone.
 */
export function createFollowRepository(db: PrismaClient = prisma): FollowRepository {
  return {
    async add(userId: string, profileId: string): Promise<void> {
      await db.follow.upsert({
        where: { userId_profileId: { userId, profileId } },
        update: {},
        create: { userId, profileId },
      });
    },

    async remove(userId: string, profileId: string): Promise<void> {
      await db.follow.deleteMany({ where: { userId, profileId } });
    },

    async isFollowing(userId: string, profileId: string): Promise<boolean> {
      const count = await db.follow.count({ where: { userId, profileId } });
      return count > 0;
    },

    async listProfilesByUser(userId: string): Promise<readonly ProfileSummary[]> {
      const rows = await db.follow.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { profile: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
      });
      return rows.map((row) => row.profile);
    },

    async listFollowedCreators(
      userId: string,
      since: Date | null,
    ): Promise<readonly FollowedCreator[]> {
      // Suspended pages are off the public surface, so they're off this list
      // too — every row here is a door to a page that opens.
      const follows = await db.follow.findMany({
        where: { userId, profile: { suspendedAt: { isSet: false } } },
        select: {
          createdAt: true,
          profile: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              // Products are unfiltered, so a plain relation count is fine;
              // the visible-post count comes from the groupBy below instead of
              // a filtered `_count`, which Mongo doesn't do.
              _count: { select: { products: true } },
              posts: {
                where: { hiddenAt: { isSet: false } },
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { createdAt: true },
              },
            },
          },
        },
      });
      if (follows.length === 0) return [];

      // Two grouped counts for the whole list rather than a query per row:
      // every visible post, and the ones since the last visit. `since` null
      // (never opened the page) counts everything as new.
      const profileIds = follows.map((follow) => follow.profile.id);
      const visible = { hiddenAt: { isSet: false }, profileId: { in: profileIds } };
      const [totals, fresh] = await Promise.all([
        db.post.groupBy({ by: ["profileId"], where: visible, _count: { _all: true } }),
        db.post.groupBy({
          by: ["profileId"],
          where: since ? { ...visible, createdAt: { gt: since } } : visible,
          _count: { _all: true },
        }),
      ]);
      const postCounts = new Map(totals.map((row) => [row.profileId, row._count._all]));
      const newCounts = new Map(fresh.map((row) => [row.profileId, row._count._all]));

      return follows.map((follow) => ({
        id: follow.profile.id,
        username: follow.profile.username,
        displayName: follow.profile.displayName,
        avatarUrl: follow.profile.avatarUrl,
        postCount: postCounts.get(follow.profile.id) ?? 0,
        productCount: follow.profile._count.products,
        followedAt: follow.createdAt,
        lastPostAt: follow.profile.posts[0]?.createdAt ?? null,
        newPostCount: newCounts.get(follow.profile.id) ?? 0,
      }));
    },

    async getFollowingSeenAt(userId: string): Promise<Date | null> {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { followingSeenAt: true },
      });
      return user?.followingSeenAt ?? null;
    },

    async markFollowingSeen(userId: string, at: Date): Promise<void> {
      await db.user.update({ where: { id: userId }, data: { followingSeenAt: at } });
    },
  };
}
