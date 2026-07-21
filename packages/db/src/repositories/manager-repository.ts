import { Prisma } from "@prisma/client";
import {
  generateMemberHandle,
  type ManagerRepository,
  type ManagerView,
  type UserRepository,
} from "@plugfolio/core";
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
        // Every account gets a member handle from birth (ADR-0009).
        create: { email, username: generateMemberHandle() },
        select: { id: true },
      });
    },

    async getHandle(userId: string): Promise<string | null> {
      const row = await db.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });
      return row?.username ?? null;
    },

    async updateUsername(userId: string, username: string): Promise<"ok" | "taken"> {
      try {
        await db.user.update({ where: { id: userId }, data: { username } });
        return "ok";
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return "taken";
        }
        throw error;
      }
    },
  };
}
