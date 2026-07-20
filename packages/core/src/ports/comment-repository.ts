/**
 * Port for comments on a creator's page. Writing needs a shopper account;
 * reading is part of the no-login public page (§2.2).
 */

export type CommentView = {
  readonly id: string;
  readonly body: string;
  /** Display name only — never the author's email (privacy). */
  readonly authorName: string | null;
  readonly createdAt: Date;
};

export type NewComment = {
  readonly profileId: string;
  readonly userId: string;
  readonly body: string;
};

export type CommentRepository = {
  add(comment: NewComment): Promise<CommentView>;
  /** Newest first. */
  listByProfile(profileId: string, limit: number): Promise<readonly CommentView[]>;
};
