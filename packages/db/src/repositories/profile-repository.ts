import type {
  AccessibleProfile,
  ProfileIdentity,
  ProfileIdentityRepository,
  ProfileRepository,
  ProfileSummary,
} from "@plugfolio/core";
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

    async listAccessibleByUser(userId: string): Promise<readonly AccessibleProfile[]> {
      const [owned, managed] = await Promise.all([
        db.profile.findMany({
          where: { userId },
          orderBy: { createdAt: "asc" },
          select: { id: true, username: true },
        }),
        db.profileManager.findMany({
          where: { userId },
          orderBy: { createdAt: "asc" },
          select: { profile: { select: { id: true, username: true } } },
        }),
      ]);
      return [
        ...owned.map((profile) => ({ ...profile, role: "admin" as const })),
        ...managed.map((row) => ({ ...row.profile, role: "manager" as const })),
      ];
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

/** Prisma implementation of the `ProfileIdentityRepository` port (brief 10). */
export function createProfileIdentityRepository(
  db: PrismaClient = prisma,
): ProfileIdentityRepository {
  return {
    async get(profileId: string): Promise<ProfileIdentity | null> {
      return db.profile.findUnique({
        where: { id: profileId },
        select: { displayName: true, avatarUrl: true, bio: true },
      });
    },

    async update(profileId: string, patch: Partial<ProfileIdentity>): Promise<void> {
      await db.profile.update({ where: { id: profileId }, data: patch });
    },

    async delete(profileId: string): Promise<void> {
      await db.profile.delete({ where: { id: profileId } });
    },
  };
}
