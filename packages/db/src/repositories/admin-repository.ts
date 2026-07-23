import type { Prisma } from "@prisma/client";
import type {
  AdminAccount,
  AdminAuditEntry,
  AdminAuditRepository,
  AdminAuditView,
  AdminMemberRepository,
  AdminMemberRow,
  AdminOverview,
  AdminOverviewRepository,
  AdminUserRepository,
  AppSettingsRepository,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementations of the admin-app ports (docs/implementation/admin-app.md). */

export function createAdminUserRepository(db: PrismaClient = prisma): AdminUserRepository {
  return {
    async findByEmail(email: string): Promise<AdminAccount | null> {
      return db.adminUser.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, passwordHash: true },
      });
    },
  };
}

export function createAdminAuditRepository(db: PrismaClient = prisma): AdminAuditRepository {
  return {
    async record(entry: AdminAuditEntry): Promise<void> {
      await db.adminAction.create({ data: entry });
    },

    async listRecent(limit: number): Promise<readonly AdminAuditView[]> {
      const rows = await db.adminAction.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          action: true,
          targetType: true,
          targetId: true,
          detail: true,
          createdAt: true,
          admin: { select: { email: true } },
        },
      });
      return rows.map(({ admin, ...row }) => ({ ...row, adminEmail: admin.email }));
    },
  };
}

export function createAppSettingsRepository(db: PrismaClient = prisma): AppSettingsRepository {
  return {
    async get(key: string): Promise<unknown> {
      const row = await db.appSetting.findUnique({ where: { key }, select: { value: true } });
      return row?.value ?? null;
    },

    async set(key: string, value: unknown): Promise<void> {
      const json = value as Prisma.InputJsonValue;
      await db.appSetting.upsert({
        where: { key },
        create: { key, value: json },
        update: { value: json },
      });
    },
  };
}

export function createAdminMemberRepository(db: PrismaClient = prisma): AdminMemberRepository {
  return {
    async search(query: string | undefined, limit: number): Promise<readonly AdminMemberRow[]> {
      const rows = await db.user.findMany({
        where: query
          ? {
              OR: [
                { email: { contains: query, mode: "insensitive" } },
                { username: { contains: query, mode: "insensitive" } },
                { name: { contains: query, mode: "insensitive" } },
              ],
            }
          : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          emailVerified: true,
          suspendedAt: true,
          createdAt: true,
          _count: { select: { profiles: true } },
          business: { select: { id: true } },
        },
      });
      return rows.map(({ _count, business, ...row }) => ({
        ...row,
        profileCount: _count.profiles,
        hasBusiness: business !== null,
      }));
    },

    async setSuspended(userId: string, at: Date | null): Promise<"ok" | "not_found"> {
      const { count } = await db.user.updateMany({
        where: { id: userId },
        data: { suspendedAt: at },
      });
      return count === 0 ? "not_found" : "ok";
    },
  };
}

export function createAdminOverviewRepository(db: PrismaClient = prisma): AdminOverviewRepository {
  return {
    async overview(since: Date): Promise<AdminOverview> {
      const [members, profiles, businesses, posts, products, taps7d, codeCopies7d, comments7d] =
        await Promise.all([
          db.user.count(),
          db.profile.count(),
          db.business.count(),
          db.post.count(),
          db.product.count(),
          db.tap.count({ where: { occurredAt: { gte: since } } }),
          db.codeCopy.count({ where: { occurredAt: { gte: since } } }),
          db.comment.count({ where: { createdAt: { gte: since } } }),
        ]);
      return { members, profiles, businesses, posts, products, taps7d, codeCopies7d, comments7d };
    },
  };
}
