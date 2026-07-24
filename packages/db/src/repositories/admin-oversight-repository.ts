import { Prisma } from "@prisma/client";
import type {
  AdminAnalytics,
  AdminAnalyticsRepository,
  AdminBusinessRepository,
  AdminBusinessRow,
  AdminCollabRepository,
  AdminCollabRow,
  AdminCollabThread,
  AdminRequirementRepository,
  AdminRequirementRow,
  Page,
  PageQuery,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementations of the marketplace-oversight + analytics ports. */

function skipTake(page: PageQuery) {
  return { skip: (page.page - 1) * page.pageSize, take: page.pageSize };
}

export function createAdminBusinessRepository(db: PrismaClient = prisma): AdminBusinessRepository {
  return {
    async search(query: string | undefined, page: PageQuery): Promise<Page<AdminBusinessRow>> {
      const where: Prisma.BusinessWhereInput = query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { user: { email: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {};
      const [rows, total] = await Promise.all([
        db.business.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...skipTake(page),
          select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
            createdAt: true,
            user: { select: { email: true, suspendedAt: true } },
            _count: { select: { requirements: true, collabs: true } },
          },
        }),
        db.business.count({ where }),
      ]);
      return {
        rows: rows.map(({ user, _count, ...row }) => ({
          ...row,
          ownerEmail: user.email,
          ownerSuspendedAt: user.suspendedAt,
          requirementCount: _count.requirements,
          collabCount: _count.collabs,
        })),
        total,
      };
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
    async search(query: string | undefined, page: PageQuery): Promise<Page<AdminRequirementRow>> {
      const where: Prisma.RequirementWhereInput = query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { brief: { contains: query, mode: "insensitive" } },
              { business: { name: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {};
      const [rows, total] = await Promise.all([
        db.requirement.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...skipTake(page),
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
        }),
        db.requirement.count({ where }),
      ]);
      return {
        rows: rows.map(({ business, _count, ...row }) => ({
          ...row,
          businessName: business.name,
          collabCount: _count.collabs,
        })),
        total,
      };
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

const collabSelect = {
  id: true,
  businessAgreedAt: true,
  creatorAgreedAt: true,
  createdAt: true,
  business: { select: { name: true, userId: true } },
  profile: { select: { username: true } },
  requirement: { select: { title: true } },
  _count: { select: { messages: true } },
} as const;

type CollabRow = Prisma.CollabGetPayload<{ select: typeof collabSelect }>;

function toCollabRow({ business, profile, requirement, _count, ...row }: CollabRow): AdminCollabRow {
  return {
    ...row,
    businessName: business.name,
    profileUsername: profile.username,
    requirementTitle: requirement?.title ?? null,
    messageCount: _count.messages,
  };
}

export function createAdminCollabRepository(db: PrismaClient = prisma): AdminCollabRepository {
  return {
    async list(query: string | undefined, page: PageQuery): Promise<Page<AdminCollabRow>> {
      const where: Prisma.CollabWhereInput = query
        ? {
            OR: [
              { business: { name: { contains: query, mode: "insensitive" } } },
              { profile: { username: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {};
      const [rows, total] = await Promise.all([
        db.collab.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...skipTake(page),
          select: collabSelect,
        }),
        db.collab.count({ where }),
      ]);
      return { rows: rows.map(toCollabRow), total };
    },

    async thread(collabId: string): Promise<AdminCollabThread | null> {
      const row = await db.collab.findUnique({
        where: { id: collabId },
        select: {
          ...collabSelect,
          messages: {
            orderBy: { createdAt: "asc" },
            select: { id: true, body: true, createdAt: true, senderUserId: true },
          },
        },
      });
      if (!row) return null;
      const { messages, ...base } = row;
      const businessOwnerId = row.business.userId;
      const summary = toCollabRow(base);
      return {
        ...summary,
        // A sender on the business account speaks as the business; anyone
        // else in the thread is the creator side (owner or manager).
        messages: messages.map(({ senderUserId, ...message }) => ({
          ...message,
          role: senderUserId === businessOwnerId ? ("business" as const) : ("creator" as const),
          senderName:
            senderUserId === businessOwnerId ? summary.businessName : summary.profileUsername,
        })),
      };
    },

    async deleteMessage(messageId: string): Promise<{ body: string } | "not_found"> {
      try {
        const deleted = await db.collabMessage.delete({
          where: { id: messageId },
          select: { body: true },
        });
        return { body: deleted.body };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          return "not_found";
        }
        throw error;
      }
    },
  };
}

export function createAdminAnalyticsRepository(
  db: PrismaClient = prisma,
): AdminAnalyticsRepository {
  return {
    async analytics(since7: Date, since30: Date, topLimit: number): Promise<AdminAnalytics> {
      const [taps7d, taps30d, codeCopies7d, codeCopies30d, bySource, byProfile, byProduct, byDay] =
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
          db.$queryRaw<{ day: Date; taps: bigint }[]>`
            SELECT date_trunc('day', "occurredAt") AS day, count(*) AS taps
            FROM "Tap" WHERE "occurredAt" >= ${since30}
            GROUP BY 1 ORDER BY 1`,
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

      // Gap-fill the 30 days so the trend chart always renders full-width.
      const tapsByDay = new Map(
        byDay.map((row) => [row.day.toISOString().slice(0, 10), Number(row.taps)]),
      );
      const DAY_MS = 24 * 60 * 60 * 1000;
      const tapsPerDay = Array.from({ length: 30 }, (_, i) => {
        const day = new Date(since30.getTime() + i * DAY_MS).toISOString().slice(0, 10);
        return { day, taps: tapsByDay.get(day) ?? 0 };
      });

      return {
        taps7d,
        taps30d,
        codeCopies7d,
        codeCopies30d,
        sourceSplit: bySource.map((row) => ({ source: row.source, taps: row._count._all })),
        tapsPerDay,
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
