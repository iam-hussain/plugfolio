import type { SocialPlatform } from "../schemas/profile-links";

/** Port for the creator-page socials row (Settings → "Your links"). */

export type ProfileLinkView = {
  readonly platform: SocialPlatform;
  readonly url: string;
};

export type ProfileLinkRepository = {
  listByProfile(profileId: string): Promise<readonly ProfileLinkView[]>;
  /** The Settings save is a replace-all: empty array clears the row. */
  replaceAll(profileId: string, links: readonly ProfileLinkView[]): Promise<void>;
};
