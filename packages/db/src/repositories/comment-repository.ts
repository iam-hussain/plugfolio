import type { CommentRepository, CommentView, NewComment } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

const viewSelect = {
  id: true,
  body: true,
  createdAt: true,
  // Display name only — the author's email never leaves this layer (privacy).
  user: { select: { name: true } },
} as const;

/** Prisma implementation of the `CommentRepository` port. */
export function createCommentRepository(db: PrismaClient = prisma): CommentRepository {
  return {
    async add(comment: NewComment): Promise<CommentView> {
      const row = await db.comment.create({
        data: { profileId: comment.profileId, userId: comment.userId, body: comment.body },
        select: viewSelect,
      });
      return { id: row.id, body: row.body, authorName: row.user.name, createdAt: row.createdAt };
    },

    async listByProfile(profileId: string, limit: number): Promise<readonly CommentView[]> {
      const rows = await db.comment.findMany({
        where: { profileId },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: viewSelect,
      });
      return rows.map((row) => ({
        id: row.id,
        body: row.body,
        authorName: row.user.name,
        createdAt: row.createdAt,
      }));
    },
  };
}
