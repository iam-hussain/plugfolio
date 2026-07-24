import type { NewReport, ReportTargetType, ReportWriteRepository } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/**
 * The product-side report inflow (admin queue's write half). Snippets are
 * resolved from the live target so the queue keeps a preview after takedowns.
 */
const SNIPPET_LENGTH = 100;

export function createReportWriteRepository(db: PrismaClient = prisma): ReportWriteRepository {
  return {
    async resolveTargetSnippet(type: ReportTargetType, targetId: string): Promise<string | null> {
      switch (type) {
        case "comment": {
          const row = await db.comment.findUnique({
            where: { id: targetId },
            select: { body: true },
          });
          return row ? row.body.slice(0, SNIPPET_LENGTH) : null;
        }
        case "product": {
          const row = await db.product.findUnique({
            where: { id: targetId },
            select: { title: true, profile: { select: { username: true } } },
          });
          return row ? `${row.title} — /${row.profile.username}` : null;
        }
        case "profile": {
          const row = await db.profile.findUnique({
            where: { id: targetId },
            select: { username: true },
          });
          return row ? `/${row.username}` : null;
        }
        case "post": {
          const row = await db.post.findUnique({
            where: { id: targetId },
            select: { caption: true, profile: { select: { username: true } } },
          });
          return row ? `${row.caption ?? "(no caption)"} — /${row.profile.username}` : null;
        }
      }
    },

    async create(report: NewReport): Promise<void> {
      await db.report.create({ data: report });
    },
  };
}
