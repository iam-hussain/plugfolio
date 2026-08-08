import type { AdminOverview, AdminOverviewRepository } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementation of the admin dashboard-overview port (docs/implementation/admin-app.md). */

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
