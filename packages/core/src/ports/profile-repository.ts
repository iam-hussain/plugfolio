/**
 * Port for creator profiles (ADR-0004: one account, up to 5 profiles). The
 * dashboard lists these and scopes every dashboard read/write to them.
 */

export type ProfileSummary = {
  readonly id: string;
  readonly username: string;
};

/** Admin = the profile's owning user; Manager = invited helper (ADR-0004). */
export type ProfileRole = "admin" | "manager";

export type AccessibleProfile = ProfileSummary & { readonly role: ProfileRole };

export type ProfileRepository = {
  /** Profiles the user OWNS (is Admin of). */
  listByUser(userId: string): Promise<readonly ProfileSummary[]>;
  /** Owned + managed — what the dashboard shows and content writes check. */
  listAccessibleByUser(userId: string): Promise<readonly AccessibleProfile[]>;
  exists(profileId: string): Promise<boolean>;
  countByUser(userId: string): Promise<number>;
  create(profile: { userId: string; username: string }): Promise<ProfileSummary>;
};
