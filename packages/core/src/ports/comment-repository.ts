/**
 * Port for comments (ADR-0013): they live on a creator's page or on a product
 * (posts deferred), threaded one level deep. Writing needs an account; reading
 * is part of the no-login public surface (§2.2). Identity per ADR-0009.
 */

export type CommentView = {
  readonly id: string;
  readonly body: string;
  /** Display name + member handle — never the author's email (privacy). */
  readonly author: { readonly name: string | null; readonly handle: string };
  /** When set, the comment speaks AS this profile — render brand + Creator badge. */
  readonly asProfile: { readonly username: string } | null;
  readonly createdAt: Date;
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

export type CommentRepository = {
  add(comment: NewComment): Promise<CommentView>;
  findTarget(commentId: string): Promise<CommentTarget | null>;
  /** Page-level threads (productId null), newest first; replies oldest first. */
  listByProfile(profileId: string, limit: number): Promise<readonly CommentThread[]>;
  /** One product's threads, newest first; replies oldest first. */
  listByProduct(productId: string, limit: number): Promise<readonly CommentThread[]>;
};
