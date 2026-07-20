import type {
  Business,
  BusinessRepository,
  CollabRepository,
  CollabSummary,
  CollabThread,
  RequirementRepository,
  RequirementView,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

const requirementSelect = {
  id: true,
  title: true,
  brief: true,
  budget: true,
  deadline: true,
  createdAt: true,
  business: { select: { name: true } },
} as const;

type RequirementRow = {
  id: string;
  title: string;
  brief: string;
  budget: string | null;
  deadline: Date | null;
  createdAt: Date;
  business: { name: string };
};

function toRequirementView(row: RequirementRow): RequirementView {
  const { business, ...rest } = row;
  return { ...rest, businessName: business.name };
}

const summarySelect = {
  id: true,
  createdAt: true,
  businessAgreedAt: true,
  creatorAgreedAt: true,
  business: { select: { name: true } },
  profile: { select: { username: true } },
  requirement: { select: { title: true } },
} as const;

type SummaryRow = {
  id: string;
  createdAt: Date;
  businessAgreedAt: Date | null;
  creatorAgreedAt: Date | null;
  business: { name: string };
  profile: { username: string };
  requirement: { title: string } | null;
};

function toSummary(row: SummaryRow): CollabSummary {
  return {
    id: row.id,
    businessName: row.business.name,
    username: row.profile.username,
    requirementTitle: row.requirement?.title ?? null,
    agreed: row.businessAgreedAt !== null && row.creatorAgreedAt !== null,
    createdAt: row.createdAt,
  };
}

/** Prisma implementations of the business-collab ports. */
export function createBusinessRepository(db: PrismaClient = prisma): BusinessRepository {
  return {
    async create(business): Promise<Business> {
      return db.business.create({
        data: business,
        select: { id: true, userId: true, name: true, description: true, logoUrl: true },
      });
    },
    async findByUser(userId): Promise<Business | null> {
      return db.business.findUnique({
        where: { userId },
        select: { id: true, userId: true, name: true, description: true, logoUrl: true },
      });
    },
  };
}

export function createRequirementRepository(db: PrismaClient = prisma): RequirementRepository {
  return {
    async create(requirement): Promise<RequirementView> {
      const row = await db.requirement.create({ data: requirement, select: requirementSelect });
      return toRequirementView(row);
    },
    async listOpen(limit): Promise<readonly RequirementView[]> {
      const rows = await db.requirement.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: requirementSelect,
      });
      return rows.map(toRequirementView);
    },
    async listByBusiness(businessId): Promise<readonly RequirementView[]> {
      const rows = await db.requirement.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        select: requirementSelect,
      });
      return rows.map(toRequirementView);
    },
    async findBusinessId(requirementId): Promise<string | null> {
      const row = await db.requirement.findUnique({
        where: { id: requirementId },
        select: { businessId: true },
      });
      return row?.businessId ?? null;
    },
  };
}

export function createCollabRepository(db: PrismaClient = prisma): CollabRepository {
  return {
    async create(collab): Promise<string> {
      const row = await db.collab.create({
        data: {
          businessId: collab.businessId,
          profileId: collab.profileId,
          requirementId: collab.requirementId,
          messages: { create: collab.firstMessage },
        },
        select: { id: true },
      });
      return row.id;
    },

    async findMatch(businessId, profileId, requirementId): Promise<string | null> {
      const row = await db.collab.findFirst({
        where: { businessId, profileId, requirementId },
        select: { id: true },
      });
      return row?.id ?? null;
    },

    async findParticipants(collabId) {
      return db.collab.findUnique({
        where: { id: collabId },
        select: { businessId: true, profileId: true },
      });
    },

    async findThread(collabId): Promise<CollabThread | null> {
      const row = await db.collab.findUnique({
        where: { id: collabId },
        select: {
          id: true,
          businessId: true,
          profileId: true,
          businessAgreedAt: true,
          creatorAgreedAt: true,
          business: { select: { name: true, userId: true } },
          profile: { select: { username: true } },
          requirement: { select: { title: true } },
          messages: {
            orderBy: { createdAt: "asc" },
            select: { id: true, body: true, senderUserId: true, createdAt: true },
          },
        },
      });
      if (!row) return null;
      return {
        id: row.id,
        businessId: row.businessId,
        profileId: row.profileId,
        businessName: row.business.name,
        username: row.profile.username,
        requirementTitle: row.requirement?.title ?? null,
        businessAgreedAt: row.businessAgreedAt,
        creatorAgreedAt: row.creatorAgreedAt,
        messages: row.messages.map((message) => ({
          id: message.id,
          body: message.body,
          fromBusiness: message.senderUserId === row.business.userId,
          createdAt: message.createdAt,
        })),
      };
    },

    async listByBusiness(businessId): Promise<readonly CollabSummary[]> {
      const rows = await db.collab.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        select: summarySelect,
      });
      return rows.map(toSummary);
    },

    async listByProfiles(profileIds): Promise<readonly CollabSummary[]> {
      const rows = await db.collab.findMany({
        where: { profileId: { in: [...profileIds] } },
        orderBy: { createdAt: "desc" },
        select: summarySelect,
      });
      return rows.map(toSummary);
    },

    async addMessage(collabId, senderUserId, body): Promise<void> {
      await db.collabMessage.create({ data: { collabId, senderUserId, body } });
    },

    async setAgreed(collabId, side, at): Promise<void> {
      // Keep the first timestamp on retries: only fill if still null.
      const field = side === "business" ? "businessAgreedAt" : "creatorAgreedAt";
      await db.collab.updateMany({
        where: { id: collabId, [field]: null },
        data: { [field]: at },
      });
    },
  };
}
