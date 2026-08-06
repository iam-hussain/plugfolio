import type {
  AdminAccount,
  AdminOperatorRow,
  AdminUserRepository,
} from "@plugfolio/core";
import { Prisma } from "../../generated/client";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementation of the admin operator-auth port (docs/implementation/admin-app.md). */

export function createAdminUserRepository(db: PrismaClient = prisma): AdminUserRepository {
  return {
    async findByEmail(email: string): Promise<AdminAccount | null> {
      return db.adminUser.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, passwordHash: true, sessionVersion: true },
      });
    },

    async findById(adminId: string): Promise<AdminAccount | null> {
      return db.adminUser.findUnique({
        where: { id: adminId },
        select: { id: true, email: true, name: true, passwordHash: true, sessionVersion: true },
      });
    },

    async list(): Promise<readonly AdminOperatorRow[]> {
      return db.adminUser.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, email: true, name: true, createdAt: true, lastSignInAt: true },
      });
    },

    async create(operator): Promise<{ id: string } | "exists"> {
      try {
        return await db.adminUser.create({ data: operator, select: { id: true } });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return "exists";
        }
        throw error;
      }
    },

    async remove(adminId: string): Promise<"ok" | "not_found"> {
      const { count } = await db.adminUser.deleteMany({ where: { id: adminId } });
      return count === 0 ? "not_found" : "ok";
    },

    async count(): Promise<number> {
      return db.adminUser.count();
    },

    async setPassword(adminId: string, passwordHash: string): Promise<void> {
      // The version bump signs out every outstanding session (port contract).
      await db.adminUser.update({
        where: { id: adminId },
        data: { passwordHash, sessionVersion: { increment: 1 } },
      });
    },

    async recordSignIn(adminId: string, at: Date): Promise<void> {
      await db.adminUser.update({ where: { id: adminId }, data: { lastSignInAt: at } });
    },
  };
}
