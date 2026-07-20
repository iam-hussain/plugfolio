import type { FollowRepository, ProfileSummary } from "@plugfolio/core";
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
        select: { profile: { select: { id: true, username: true } } },
      });
      return rows.map((row) => row.profile);
    },
  };
}
