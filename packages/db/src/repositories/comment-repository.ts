import type { CommentRepository, CommentView, NewComment } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

const viewSelect = {
  id: true,
  body: true,
  createdAt: true,
  // Display name + member handle — the author's email never leaves this layer.
  user: { select: { name: true, username: true } },
  // ADR-0009: when set, the comment speaks AS this profile.
  asProfile: { select: { username: true } },
} as const;

type Row = {
  id: string;
  body: string;
  createdAt: Date;
  user: { name: string | null; username: string };
  asProfile: { username: string } | null;
};

function toView(row: Row): CommentView {
  return {
    id: row.id,
    body: row.body,
    author: { name: row.user.name, handle: row.user.username },
    asProfile: row.asProfile,
    createdAt: row.createdAt,
  };
}

/** Prisma implementation of the `CommentRepository` port. */
export function createCommentRepository(db: PrismaClient = prisma): CommentRepository {
  return {
    async add(comment: NewComment): Promise<CommentView> {
      const row = await db.comment.create({
        data: {
          profileId: comment.profileId,
          userId: comment.userId,
          asProfileId: comment.asProfileId,
          body: comment.body,
        },
        select: viewSelect,
      });
      return toView(row);
    },

    async listByProfile(profileId: string, limit: number): Promise<readonly CommentView[]> {
      const rows = await db.comment.findMany({
        where: { profileId },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: viewSelect,
      });
      return rows.map(toView);
    },
  };
}
