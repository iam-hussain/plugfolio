import type {
  CommentPage,
  CommentQuery,
  CommentRepository,
  CommentTarget,
  CommentThread,
  CommentView,
  NewComment,
  ReactionValue,
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

/** Counts + the viewer's own pick, keyed by comment id. */
type Reactions = {
  counts: Map<string, { helpful: number; unhelpful: number }>;
  mine: Map<string, ReactionValue>;
};

const EMPTY = { helpful: 0, unhelpful: 0 };

function toView(row: Row, reactions: Reactions): CommentView {
  const counts = reactions.counts.get(row.id) ?? EMPTY;
  return {
    id: row.id,
    body: row.body,
    author: { name: row.user.name, handle: row.user.username },
    asProfile: row.asProfile,
    createdAt: row.createdAt,
    helpfulCount: counts.helpful,
    unhelpfulCount: counts.unhelpful,
    myReaction: reactions.mine.get(row.id) ?? null,
  };
}

function toThread(row: Row & { replies: Row[] }, reactions: Reactions): CommentThread {
  return {
    ...toView(row, reactions),
    replies: row.replies.map((reply) => toView(reply, reactions)),
  };
}

/** Prisma implementation of the `CommentRepository` port. */
export function createCommentRepository(db: PrismaClient = prisma): CommentRepository {
  /**
   * Read a page of threads for one target.
   *
   * ponytail: top-level ids are pulled in full, sorted here, then only the
   * page's threads are hydrated. Sorting by "most helpful" is a count over a
   * relation, which Mongo won't order by directly, and a page's comment list is
   * hundreds — not millions. If a page ever carries tens of thousands, this is
   * the place that needs a denormalised counter.
   */
  async function page(
    where: { profileId?: string; productId?: string | { isSet: false } },
    query: CommentQuery,
  ): Promise<CommentPage> {
    const topLevel = { ...where, parentId: { isSet: false } as const };
    const ids = await db.comment.findMany({
      where: topLevel,
      select: { id: true, createdAt: true },
    });
    if (ids.length === 0) return { threads: [], total: 0 };

    const counts = await countReactions(ids.map((row) => row.id));
    const ordered = [...ids].sort((a, b) => {
      if (query.sort === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
      if (query.sort === "helpful") {
        const helpful = (counts.get(b.id)?.helpful ?? 0) - (counts.get(a.id)?.helpful ?? 0);
        // Ties fall back to newest, so an unreacted thread still reads sanely.
        if (helpful !== 0) return helpful;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const pageIds = ordered.slice(query.skip, query.skip + query.limit).map((row) => row.id);
    if (pageIds.length === 0) return { threads: [], total: ids.length };

    const rows = await db.comment.findMany({
      where: { id: { in: pageIds } },
      select: threadSelect,
    });
    // `in` doesn't preserve order — restore the sort we just computed.
    const byId = new Map(rows.map((row) => [row.id, row]));
    const threads = pageIds.map((id) => byId.get(id)).filter((row) => row !== undefined);

    // Replies carry counts too, so the reaction lookup covers both levels.
    const allIds = threads.flatMap((row) => [row.id, ...row.replies.map((r) => r.id)]);
    const reactions: Reactions = {
      counts: await countReactions(allIds),
      mine: await viewerReactions(allIds, query.viewerId),
    };

    return { threads: threads.map((row) => toThread(row, reactions)), total: ids.length };
  }

  async function countReactions(
    commentIds: readonly string[],
  ): Promise<Map<string, { helpful: number; unhelpful: number }>> {
    const counts = new Map<string, { helpful: number; unhelpful: number }>();
    if (commentIds.length === 0) return counts;
    const grouped = await db.commentReaction.groupBy({
      by: ["commentId", "value"],
      where: { commentId: { in: [...commentIds] } },
      _count: { _all: true },
    });
    for (const row of grouped) {
      const entry = counts.get(row.commentId) ?? { helpful: 0, unhelpful: 0 };
      if (row.value === "helpful") entry.helpful = row._count._all;
      if (row.value === "unhelpful") entry.unhelpful = row._count._all;
      counts.set(row.commentId, entry);
    }
    return counts;
  }

  async function viewerReactions(
    commentIds: readonly string[],
    viewerId: string | null,
  ): Promise<Map<string, ReactionValue>> {
    if (!viewerId || commentIds.length === 0) return new Map();
    const rows = await db.commentReaction.findMany({
      where: { userId: viewerId, commentId: { in: [...commentIds] } },
      select: { commentId: true, value: true },
    });
    return new Map(rows.map((row) => [row.commentId, row.value as ReactionValue]));
  }

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
      // A brand-new comment has no reactions by definition.
      return toView(row, { counts: new Map(), mine: new Map() });
    },

    async findTarget(commentId: string): Promise<CommentTarget | null> {
      return db.comment.findUnique({
        where: { id: commentId },
        select: { profileId: true, productId: true, parentId: true },
      });
    },

    async exists(commentId: string): Promise<boolean> {
      return (await db.comment.count({ where: { id: commentId } })) > 0;
    },

    async setReaction(
      commentId: string,
      userId: string,
      value: ReactionValue | null,
    ): Promise<void> {
      if (value === null) {
        // deleteMany, so clearing something already clear is a quiet no-op.
        await db.commentReaction.deleteMany({ where: { commentId, userId } });
        return;
      }
      // Upsert on the (comment, user) pair: a double-fired tap in an in-app
      // browser (§6.8) lands as one row, and changing your mind is an update.
      await db.commentReaction.upsert({
        where: { commentId_userId: { commentId, userId } },
        update: { value },
        create: { commentId, userId, value },
      });
    },

    async listByProfile(profileId: string, query: CommentQuery): Promise<CommentPage> {
      return page({ profileId, productId: { isSet: false } }, query);
    },

    async listByProduct(productId: string, query: CommentQuery): Promise<CommentPage> {
      return page({ productId }, query);
    },
  };
}
