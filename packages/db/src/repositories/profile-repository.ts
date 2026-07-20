import type { ProfileReadRepository, ProfileSummary } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementation of the `ProfileReadRepository` port. */
export function createProfileRepository(db: PrismaClient = prisma): ProfileReadRepository {
  return {
    async listByUser(userId: string): Promise<readonly ProfileSummary[]> {
      return db.profile.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { id: true, username: true },
      });
    },
  };
}
