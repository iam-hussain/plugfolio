/**
 * Port for comments (ADR-0013): they live on a creator's page or on a product
 * (posts deferred), threaded one level deep. Writing needs an account; reading
 * is part of the no-login public surface (§2.2). Identity per ADR-0009.
 */

import type { CommentSort, ReactionValue } from "../schemas/comment-reaction";

export type CommentView = {
  readonly id: string;
  readonly body: string;
  /** Display name + member handle — never the author's email (privacy). */
  readonly author: { readonly name: string | null; readonly handle: string };
  /** When set, the comment speaks AS this profile — render brand + Creator badge. */
  readonly asProfile: { readonly username: string } | null;
  readonly createdAt: Date;
  /** Counts are public — reading them never needs an account (§2.2). */
  readonly helpfulCount: number;
  readonly unhelpfulCount: number;
  /** What the *viewing* account picked; null when signed out or unreacted. */
  readonly myReaction: ReactionValue | null;
};

/** A top-level comment with its replies (one level — ADR-0013). */
export type CommentThread = CommentView & {
  readonly replies: readonly CommentView[];
};

/** The slice the service needs to validate a reply's parent. */
export type CommentTarget = {
  readonly profileId: string;
  readonly productId: string | null;
  readonly parentId: string | null;
};

export type NewComment = {
  readonly profileId: string;
  readonly productId: string | null;
  readonly parentId: string | null;
  readonly userId: string;
  readonly asProfileId: string | null;
  readonly body: string;
};

/**
 * How a thread is read. `viewerId` only decides `myReaction` — the comments and
 * their counts are identical signed out, because reading is account-free.
 */
export type CommentQuery = {
  readonly sort: CommentSort;
  readonly limit: number;
  readonly skip: number;
  readonly viewerId: string | null;
};

export type CommentPage = {
  readonly threads: readonly CommentThread[];
  /** Top-level comments in total — the "Load more" denominator. */
  readonly total: number;
};

export type CommentRepository = {
  add(comment: NewComment): Promise<CommentView>;
  findTarget(commentId: string): Promise<CommentTarget | null>;
  /** Page-level threads (productId null); replies always oldest first. */
  listByProfile(profileId: string, query: CommentQuery): Promise<CommentPage>;
  /** One product's threads; replies always oldest first. */
  listByProduct(productId: string, query: CommentQuery): Promise<CommentPage>;
  /** Upsert or clear the viewer's reaction — idempotent on the (comment, user) pair. */
  setReaction(commentId: string, userId: string, value: ReactionValue | null): Promise<void>;
  /** Exists check for the reaction write — an unknown comment is a 404. */
  exists(commentId: string): Promise<boolean>;
};
