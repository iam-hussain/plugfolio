import type { AdPlacement, AdPlacementRepository } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

const select = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  url: true,
  activeFrom: true,
  activeUntil: true,
} as const;

/** Prisma implementation of the `AdPlacementRepository` port (ADR-0020). */
export function createAdPlacementRepository(db: PrismaClient = prisma): AdPlacementRepository {
  return {
    async findLive(now: Date): Promise<AdPlacement | null> {
      // One slot per page: the most recently started live placement wins, so an
      // operator replaces what's showing by adding a new one rather than by
      // hunting for the old one first.
      // Mongo: an unset `activeUntil` means "runs until stopped", and `null`
      // does not match an absent field — hence the isSet branch.
      return db.adPlacement.findFirst({
        where: {
          activeFrom: { lte: now },
          OR: [{ activeUntil: { isSet: false } }, { activeUntil: { gt: now } }],
        },
        orderBy: { activeFrom: "desc" },
        select,
      });
    },

    async list(): Promise<readonly AdPlacement[]> {
      return db.adPlacement.findMany({ orderBy: { createdAt: "desc" }, select });
    },

    async create(placement: Omit<AdPlacement, "id">): Promise<AdPlacement> {
      return db.adPlacement.create({ data: placement, select });
    },

    async remove(id: string): Promise<void> {
      await db.adPlacement.deleteMany({ where: { id } });
    },
  };
}
