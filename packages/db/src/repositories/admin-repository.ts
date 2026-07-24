import { Prisma } from "@prisma/client";
import type {
  AdminAccount,
  AdminAuditEntry,
  AdminAuditFilter,
  AdminAuditRepository,
  AdminAuditView,
  AdminMemberDetail,
  AdminMemberRepository,
  AdminMemberRow,
  AdminOperatorRow,
  AdminOverview,
  AdminOverviewRepository,
  AdminReportRepository,
  AdminReportRow,
  AdminUserRepository,
  AppSettingsRepository,
  MemberStatusFilter,
  Page,
  PageQuery,
  ReportStatus,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementations of the admin-app ports (docs/implementation/admin-app.md). */

function skipTake(page: PageQuery) {
  return { skip: (page.page - 1) * page.pageSize, take: page.pageSize };
}

export function createAdminUserRepository(db: PrismaClient = prisma): AdminUserRepository {
  return {
    async findByEmail(email: string): Promise<AdminAccount | null> {
      return db.adminUser.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, passwordHash: true },
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
      await db.adminUser.update({ where: { id: adminId }, data: { passwordHash } });
    },

    async recordSignIn(adminId: string, at: Date): Promise<void> {
      await db.adminUser.update({ where: { id: adminId }, data: { lastSignInAt: at } });
    },
  };
}

const auditSelect = {
  id: true,
  action: true,
  targetType: true,
  targetId: true,
  detail: true,
  createdAt: true,
  admin: { select: { email: true } },
} as const;

type AuditRow = Prisma.AdminActionGetPayload<{ select: typeof auditSelect }>;

function toAuditView({ admin, ...row }: AuditRow): AdminAuditView {
  return { ...row, adminEmail: admin.email };
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
        select: auditSelect,
      });
      return rows.map(toAuditView);
    },

    async search(filter: AdminAuditFilter, page: PageQuery): Promise<Page<AdminAuditView>> {
      const where: Prisma.AdminActionWhereInput = {
        ...(filter.adminEmail ? { admin: { email: filter.adminEmail } } : {}),
        ...(filter.actionPrefix ? { action: { startsWith: filter.actionPrefix } } : {}),
        ...(filter.since ? { createdAt: { gte: filter.since } } : {}),
      };
      const [rows, total] = await Promise.all([
        db.adminAction.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...skipTake(page),
          select: auditSelect,
        }),
        db.adminAction.count({ where }),
      ]);
      return { rows: rows.map(toAuditView), total };
    },

    async admins(): Promise<readonly string[]> {
      const rows = await db.adminUser.findMany({ select: { email: true }, orderBy: { email: "asc" } });
      return rows.map((r) => r.email);
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

function memberStatusWhere(status: MemberStatusFilter | undefined): Prisma.UserWhereInput {
  switch (status) {
    case "active":
      return { emailVerified: { not: null }, suspendedAt: null };
    case "unverified":
      return { emailVerified: null };
    case "suspended":
      return { suspendedAt: { not: null } };
    default:
      return {};
  }
}

const memberSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  emailVerified: true,
  suspendedAt: true,
  createdAt: true,
  _count: { select: { profiles: true } },
  business: { select: { id: true } },
} as const;

type MemberRow = Prisma.UserGetPayload<{ select: typeof memberSelect }>;

function toMemberRow({ _count, business, ...row }: MemberRow): AdminMemberRow {
  return { ...row, profileCount: _count.profiles, hasBusiness: business !== null };
}

export function createAdminMemberRepository(db: PrismaClient = prisma): AdminMemberRepository {
  return {
    async search(
      query: string | undefined,
      status: MemberStatusFilter | undefined,
      page: PageQuery,
    ): Promise<Page<AdminMemberRow>> {
      const where: Prisma.UserWhereInput = {
        ...memberStatusWhere(status),
        ...(query
          ? {
              OR: [
                { email: { contains: query, mode: "insensitive" } },
                { username: { contains: query, mode: "insensitive" } },
                { name: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [rows, total] = await Promise.all([
        db.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...skipTake(page),
          select: memberSelect,
        }),
        db.user.count({ where }),
      ]);
      return { rows: rows.map(toMemberRow), total };
    },

    async setSuspended(userId: string, at: Date | null): Promise<"ok" | "not_found"> {
      const { count } = await db.user.updateMany({
        where: { id: userId },
        data: { suspendedAt: at },
      });
      return count === 0 ? "not_found" : "ok";
    },

    async setSuspendedBulk(userIds: readonly string[], at: Date): Promise<number> {
      const { count } = await db.user.updateMany({
        where: { id: { in: [...userIds] } },
        data: { suspendedAt: at },
      });
      return count;
    },

    async detail(userId: string): Promise<AdminMemberDetail | null> {
      const row = await db.user.findUnique({
        where: { id: userId },
        select: {
          ...memberSelect,
          profiles: { select: { id: true, username: true }, orderBy: { createdAt: "asc" } },
          managedProfiles: {
            select: { profile: { select: { id: true, username: true } } },
            orderBy: { createdAt: "asc" },
          },
          accounts: { select: { provider: true } },
          comments: {
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { body: true, createdAt: true },
          },
          _count: { select: { profiles: true, follows: true } },
        },
      });
      if (!row) return null;
      const {
        profiles,
        managedProfiles,
        accounts,
        comments,
        _count,
        business,
        ...member
      } = row;
      return {
        ...member,
        profileCount: _count.profiles,
        hasBusiness: business !== null,
        profiles: [
          ...profiles.map((p) => ({ ...p, role: "Owner" as const })),
          ...managedProfiles.map((m) => ({ ...m.profile, role: "Manager" as const })),
        ],
        // Auth.js Account rows have no created timestamp — provider only.
        socials: accounts
          .filter((a) => a.provider !== "credentials")
          .map((a) => ({ provider: a.provider, connectedAt: null })),
        recentComments: comments,
        followingCount: _count.follows,
      };
    },

    async remove(userId: string): Promise<{ email: string } | "not_found"> {
      try {
        const removed = await db.user.delete({ where: { id: userId }, select: { email: true } });
        return { email: removed.email };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          return "not_found";
        }
        throw error;
      }
    },
  };
}

export function createAdminReportRepository(db: PrismaClient = prisma): AdminReportRepository {
  return {
    async list(status: ReportStatus | "all", page: PageQuery): Promise<Page<AdminReportRow>> {
      const where = status === "all" ? {} : { status };
      const [rows, total] = await Promise.all([
        db.report.findMany({
          where,
          // Open queue is triage order (oldest first); history newest first.
          orderBy: { createdAt: status === "open" ? "asc" : "desc" },
          ...skipTake(page),
        }),
        db.report.count({ where }),
      ]);
      return { rows, total };
    },

    async setStatus(
      reportId: string,
      status: ReportStatus,
      at: Date,
    ): Promise<{ snippet: string } | "not_found"> {
      try {
        const row = await db.report.update({
          where: { id: reportId },
          data: { status, resolvedAt: status === "open" ? null : at },
          select: { snippet: true },
        });
        return { snippet: row.snippet };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          return "not_found";
        }
        throw error;
      }
    },

    async openCount(): Promise<number> {
      return db.report.count({ where: { status: "open" } });
    },
  };
}

export function createAdminOverviewRepository(db: PrismaClient = prisma): AdminOverviewRepository {
  return {
    async overview(since7: Date, since14: Date): Promise<AdminOverview> {
      const priorWindow = { gte: since14, lt: since7 };
      const [
        members,
        membersNew7d,
        profiles,
        profilesNew7d,
        businesses,
        businessesNew7d,
        posts,
        postsNew7d,
        products,
        productsNew7d,
        taps7d,
        tapsPrior7d,
        codeCopies7d,
        codeCopiesPrior7d,
        comments7d,
        openReports,
      ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { createdAt: { gte: since7 } } }),
        db.profile.count(),
        db.profile.count({ where: { createdAt: { gte: since7 } } }),
        db.business.count(),
        db.business.count({ where: { createdAt: { gte: since7 } } }),
        db.post.count(),
        db.post.count({ where: { createdAt: { gte: since7 } } }),
        db.product.count(),
        db.product.count({ where: { createdAt: { gte: since7 } } }),
        db.tap.count({ where: { occurredAt: { gte: since7 } } }),
        db.tap.count({ where: { occurredAt: priorWindow } }),
        db.codeCopy.count({ where: { occurredAt: { gte: since7 } } }),
        db.codeCopy.count({ where: { occurredAt: priorWindow } }),
        db.comment.count({ where: { createdAt: { gte: since7 } } }),
        db.report.count({ where: { status: "open" } }),
      ]);
      return {
        members,
        membersNew7d,
        profiles,
        profilesNew7d,
        businesses,
        businessesNew7d,
        posts,
        postsNew7d,
        products,
        productsNew7d,
        taps7d,
        tapsPrior7d,
        codeCopies7d,
        codeCopiesPrior7d,
        comments7d,
        openReports,
      };
    },
  };
}
