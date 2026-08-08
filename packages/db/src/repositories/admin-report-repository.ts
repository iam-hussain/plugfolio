import type {
  AdminReportRepository,
  AdminReportRow,
  Page,
  PageQuery,
  ReportStatus,
} from "@plugfolio/core";
import { Prisma } from "../../generated/client";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementation of the admin reports-triage port (docs/implementation/admin-app.md). */

function skipTake(page: PageQuery) {
  return { skip: (page.page - 1) * page.pageSize, take: page.pageSize };
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
