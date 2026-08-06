import type {
  AdminAuditEntry,
  AdminAuditFilter,
  AdminAuditRepository,
  AdminAuditView,
  Page,
  PageQuery,
} from "@plugfolio/core";
import type { Prisma } from "../../generated/client";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementation of the admin audit-log port (docs/implementation/admin-app.md). */

function skipTake(page: PageQuery) {
  return { skip: (page.page - 1) * page.pageSize, take: page.pageSize };
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
      const rows = await db.adminUser.findMany({
        select: { email: true },
        orderBy: { email: "asc" },
      });
      return rows.map((r) => r.email);
    },
  };
}
