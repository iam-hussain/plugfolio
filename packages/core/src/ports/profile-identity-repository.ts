/** Port for a profile's public identity + deletion (brief 10 Settings). */

import type { PageAccent, PageGridStyle, PageHeaderStyle } from "../schemas/page-appearance";

/**
 * How the page looks (ADR-0017). Null on any field = the default; the read
 * model resolves it once so no component has to know what a default is.
 */
export type PageAppearance = {
  readonly accent: PageAccent | null;
  readonly headerStyle: PageHeaderStyle | null;
  readonly gridStyle: PageGridStyle | null;
  readonly greeting: string | null;
};

export type ProfileIdentity = PageAppearance & {
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
