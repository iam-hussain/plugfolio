/**
 * Read port for a user's profiles (ADR-0004: one account, up to 5 profiles).
 * The dashboard lists these and scopes every dashboard read to them.
 */

export type ProfileSummary = {
  readonly id: string;
  readonly username: string;
};

export type ProfileReadRepository = {
  listByUser(userId: string): Promise<readonly ProfileSummary[]>;
};
