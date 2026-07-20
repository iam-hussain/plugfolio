/**
 * Port for creator profiles (ADR-0004: one account, up to 5 profiles). The
 * dashboard lists these and scopes every dashboard read/write to them.
 */

export type ProfileSummary = {
  readonly id: string;
  readonly username: string;
};

export type ProfileRepository = {
  listByUser(userId: string): Promise<readonly ProfileSummary[]>;
  exists(profileId: string): Promise<boolean>;
  countByUser(userId: string): Promise<number>;
  create(profile: { userId: string; username: string }): Promise<ProfileSummary>;
};
