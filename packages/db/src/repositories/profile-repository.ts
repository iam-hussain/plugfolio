import type { ProfileRepository, ProfileSummary } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementation of the `ProfileRepository` port. */
export function createProfileRepository(db: PrismaClient = prisma): ProfileRepository {
  return {
    async listByUser(userId: string): Promise<readonly ProfileSummary[]> {
      return db.profile.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { id: true, username: true },
      });
    },

    async exists(profileId: string): Promise<boolean> {
      const count = await db.profile.count({ where: { id: profileId } });
      return count > 0;
    },

    async countByUser(userId: string): Promise<number> {
      return db.profile.count({ where: { userId } });
    },

    async create(profile: { userId: string; username: string }): Promise<ProfileSummary> {
      return db.profile.create({
        data: profile,
        select: { id: true, username: true },
      });
    },
  };
}
