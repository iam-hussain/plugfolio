import { Prisma } from "@prisma/client";
import type {
  AdminAnalytics,
  AdminAnalyticsRepository,
  AdminBusinessRepository,
  AdminBusinessRow,
  AdminCollabRepository,
  AdminCollabRow,
  AdminRequirementRepository,
  AdminRequirementRow,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementations of the marketplace-oversight + analytics ports. */

export function createAdminBusinessRepository(db: PrismaClient = prisma): AdminBusinessRepository {
  return {
    async search(query: string | undefined, limit: number): Promise<readonly AdminBusinessRow[]> {
      const rows = await db.business.findMany({
        where: query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { user: { email: { contains: query, mode: "insensitive" } } },
              ],
            }
          : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          createdAt: true,
          user: { select: { email: true, suspendedAt: true } },
          _count: { select: { requirements: true, collabs: true } },
        },
      });
      return rows.map(({ user, _count, ...row }) => ({
        ...row,
        ownerEmail: user.email,
        ownerSuspendedAt: user.suspendedAt,
        requirementCount: _count.requirements,
        collabCount: _count.collabs,
      }));
    },

    async clearLogo(businessId: string): Promise<"ok" | "not_found"> {
      const { count } = await db.business.updateMany({
        where: { id: businessId },
        data: { logoUrl: null },
      });
      return count === 0 ? "not_found" : "ok";
    },
  };
}

export function createAdminRequirementRepository(
  db: PrismaClient = prisma,
): AdminRequirementRepository {
  return {
    async search(
      query: string | undefined,
      limit: number,
    ): Promise<readonly AdminRequirementRow[]> {
      const rows = await db.requirement.findMany({
        where: query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { brief: { contains: query, mode: "insensitive" } },
                { business: { name: { contains: query, mode: "insensitive" } } },
              ],
            }
          : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          brief: true,
          budget: true,
          deadline: true,
          createdAt: true,
          business: { select: { name: true } },
          _count: { select: { collabs: true } },
        },
      });
      return rows.map(({ business, _count, ...row }) => ({
        ...row,
        businessName: business.name,
        collabCount: _count.collabs,
      }));
    },

    async delete(requirementId: string): Promise<{ title: string } | "not_found"> {
      try {
        const deleted = await db.requirement.delete({
          where: { id: requirementId },
          select: { title: true },
        });
        return { title: deleted.title };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          return "not_found";
        }
        throw error;
      }
    },
  };
}

export function createAdminCollabRepository(db: PrismaClient = prisma): AdminCollabRepository {
  return {
    async list(query: string | undefined, limit: number): Promise<readonly AdminCollabRow[]> {
      const rows = await db.collab.findMany({
        where: query
          ? {
              OR: [
                { business: { name: { contains: query, mode: "insensitive" } } },
                { profile: { username: { contains: query, mode: "insensitive" } } },
              ],
            }
          : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          businessAgreedAt: true,
          creatorAgreedAt: true,
          createdAt: true,
          business: { select: { name: true } },
          profile: { select: { username: true } },
          requirement: { select: { title: true } },
          _count: { select: { messages: true } },
        },
      });
      return rows.map(({ business, profile, requirement, _count, ...row }) => ({
        ...row,
        businessName: business.name,
        profileUsername: profile.username,
        requirementTitle: requirement?.title ?? null,
        messageCount: _count.messages,
      }));
    },
  };
}

export function createAdminAnalyticsRepository(
  db: PrismaClient = prisma,
): AdminAnalyticsRepository {
  return {
    async analytics(since7: Date, since30: Date, topLimit: number): Promise<AdminAnalytics> {
      const [taps7d, taps30d, codeCopies7d, codeCopies30d, bySource, byProfile, byProduct] =
        await Promise.all([
          db.tap.count({ where: { occurredAt: { gte: since7 } } }),
          db.tap.count({ where: { occurredAt: { gte: since30 } } }),
          db.codeCopy.count({ where: { occurredAt: { gte: since7 } } }),
          db.codeCopy.count({ where: { occurredAt: { gte: since30 } } }),
          db.tap.groupBy({
            by: ["source"],
            where: { occurredAt: { gte: since30 } },
            _count: { _all: true },
          }),
          db.tap.groupBy({
            by: ["profileId"],
            where: { occurredAt: { gte: since30 } },
            _count: { _all: true },
            orderBy: { _count: { profileId: "desc" } },
            take: topLimit,
          }),
          db.tap.groupBy({
            by: ["productId"],
            where: { occurredAt: { gte: since30 } },
            _count: { _all: true },
            orderBy: { _count: { productId: "desc" } },
            take: topLimit,
          }),
        ]);

      // Resolve display names for the leaders (two small IN queries).
      const [profiles, products] = await Promise.all([
        db.profile.findMany({
          where: { id: { in: byProfile.map((row) => row.profileId) } },
          select: { id: true, username: true },
        }),
        db.product.findMany({
          where: { id: { in: byProduct.map((row) => row.productId) } },
          select: { id: true, title: true, profile: { select: { username: true } } },
        }),
      ]);
      const profileNames = new Map(profiles.map((p) => [p.id, p.username]));
      const productNames = new Map(products.map((p) => [p.id, p]));

      return {
        taps7d,
        taps30d,
        codeCopies7d,
        codeCopies30d,
        sourceSplit: bySource.map((row) => ({ source: row.source, taps: row._count._all })),
        topProfiles: byProfile.map((row) => ({
          username: profileNames.get(row.profileId) ?? "(deleted)",
          taps: row._count._all,
        })),
        topProducts: byProduct.map((row) => {
          const product = productNames.get(row.productId);
          return {
            title: product?.title ?? "(deleted)",
            username: product?.profile.username ?? "",
            taps: row._count._all,
          };
        }),
      };
    },
  };
}
