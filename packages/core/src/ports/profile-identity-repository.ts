/** Port for a profile's public identity + deletion (brief 10 Settings). */

export type ProfileIdentity = {
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly bio: string | null;
};

export type ProfileIdentityRepository = {
  get(profileId: string): Promise<ProfileIdentity | null>;
  update(profileId: string, patch: Partial<ProfileIdentity>): Promise<void>;
  /** Cascades the profile's content; the username frees up with the row. */
  delete(profileId: string): Promise<void>;
};
