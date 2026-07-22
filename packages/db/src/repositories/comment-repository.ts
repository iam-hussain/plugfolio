import type {
  CommentRepository,
  CommentTarget,
  CommentThread,
  CommentView,
  NewComment,
} from "@plugfolio/core";
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

// Top-level rows carry their replies (one level — ADR-0013), oldest first so
// the thread reads downward.
const threadSelect = {
  ...viewSelect,
  replies: { orderBy: { createdAt: "asc" }, select: viewSelect },
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

function toThread(row: Row & { replies: Row[] }): CommentThread {
  return { ...toView(row), replies: row.replies.map(toView) };
}

/** Prisma implementation of the `CommentRepository` port. */
export function createCommentRepository(db: PrismaClient = prisma): CommentRepository {
  return {
    async add(comment: NewComment): Promise<CommentView> {
      const row = await db.comment.create({
        data: {
          profileId: comment.profileId,
          productId: comment.productId,
          parentId: comment.parentId,
          userId: comment.userId,
          asProfileId: comment.asProfileId,
          body: comment.body,
        },
        select: viewSelect,
      });
      return toView(row);
    },

    async findTarget(commentId: string): Promise<CommentTarget | null> {
      return db.comment.findUnique({
        where: { id: commentId },
        select: { profileId: true, productId: true, parentId: true },
      });
    },

    async listByProfile(profileId: string, limit: number): Promise<readonly CommentThread[]> {
      const rows = await db.comment.findMany({
        where: { profileId, productId: null, parentId: null },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: threadSelect,
      });
      return rows.map(toThread);
    },

    async listByProduct(productId: string, limit: number): Promise<readonly CommentThread[]> {
      const rows = await db.comment.findMany({
        where: { productId, parentId: null },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: threadSelect,
      });
      return rows.map(toThread);
    },
  };
}
