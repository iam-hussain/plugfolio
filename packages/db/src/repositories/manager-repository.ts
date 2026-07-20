import type { ManagerRepository, ManagerView, UserRepository } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementations of the Manager ports (ADR-0004). */

export function createManagerRepository(db: PrismaClient = prisma): ManagerRepository {
  return {
    async list(profileId: string): Promise<readonly ManagerView[]> {
      const rows = await db.profileManager.findMany({
        where: { profileId },
        orderBy: { createdAt: "asc" },
        select: { userId: true, user: { select: { email: true, name: true } } },
      });
      return rows.map((row) => ({
        userId: row.userId,
        email: row.user.email,
        name: row.user.name,
      }));
    },

    async count(profileId: string): Promise<number> {
      return db.profileManager.count({ where: { profileId } });
    },

    async add(profileId: string, userId: string): Promise<void> {
      await db.profileManager.upsert({
        where: { profileId_userId: { profileId, userId } },
        update: {},
        create: { profileId, userId },
      });
    },

    async remove(profileId: string, userId: string): Promise<void> {
      await db.profileManager.deleteMany({ where: { profileId, userId } });
    },
  };
}

export function createUserRepository(db: PrismaClient = prisma): UserRepository {
  return {
    async findOrCreateByEmail(email: string): Promise<{ id: string }> {
      return db.user.upsert({
        where: { email },
        update: {},
        create: { email },
        select: { id: true },
      });
    },
  };
}
