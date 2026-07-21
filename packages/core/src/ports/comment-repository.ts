/**
 * Port for comments on a creator's page. Writing needs a shopper account;
 * reading is part of the no-login public page (§2.2). Identity per ADR-0009:
 * a comment speaks either as the author's @member-handle or as a profile the
 * author belongs to.
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

export type NewComment = {
  readonly profileId: string;
  readonly userId: string;
  readonly asProfileId: string | null;
  readonly body: string;
};

export type CommentRepository = {
  add(comment: NewComment): Promise<CommentView>;
  /** Newest first. */
  listByProfile(profileId: string, limit: number): Promise<readonly CommentView[]>;
};
