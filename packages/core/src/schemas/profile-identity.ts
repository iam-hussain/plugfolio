import { z } from "zod";
import {
  pageAccent,
  pageCoverStyle,
  pageGreeting,
  pageGridStyle,
  pageHeaderStyle,
  pageLinkMode,
} from "./page-appearance";

/**
 * Public-identity edits from profile Settings (brief 10): display name, the
 * pasted avatar URL, bio, plus how the page looks (ADR-0017). All optional —
 * the form PATCHes what changed; null clears a field.
 */
export const updateProfileIdentityInput = z.object({
  profileId: z.string().uuid(),
  displayName: z.string().trim().min(1).max(80).nullish(),
  avatarUrl: z.string().trim().url().max(500).nullish(),
  bio: z.string().trim().min(1).max(280).nullish(),
  accent: pageAccent.nullish(),
  headerStyle: pageHeaderStyle.nullish(),
  gridStyle: pageGridStyle.nullish(),
  coverStyle: pageCoverStyle.nullish(),
  linkMode: pageLinkMode.nullish(),
  greeting: pageGreeting.nullish(),
});

export type UpdateProfileIdentityInput = z.infer<typeof updateProfileIdentityInput>;
