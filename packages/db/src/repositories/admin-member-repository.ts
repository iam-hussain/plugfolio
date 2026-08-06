import type {
  AdminMemberDetail,
  AdminMemberRepository,
  AdminMemberRow,
  MemberStatusFilter,
  Page,
  PageQuery,
} from "@plugfolio/core";
import { Prisma } from "../../generated/client";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementation of the admin members port (docs/implementation/admin-app.md). */

function skipTake(page: PageQuery) {
  return { skip: (page.page - 1) * page.pageSize, take: page.pageSize };
}

function memberStatusWhere(status: MemberStatusFilter | undefined): Prisma.UserWhereInput {
  switch (status) {
    case "active":
      // Mongo: never-suspended rows have no `suspendedAt` field — match unset.
      return { emailVerified: { not: null }, suspendedAt: { isSet: false } };
    case "unverified":
      return { emailVerified: { isSet: false } };
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
      const { profiles, managedProfiles, accounts, comments, _count, business, ...member } = row;
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
