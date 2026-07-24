import { z } from "zod";

/**
 * "Your links" (design-out: the creator-page socials row, authored in
 * dashboard Settings). One URL per platform; the save replaces the whole set
 * so the form stays a single Save button.
 */
export const socialPlatform = z.enum([
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
  "website",
]);

export type SocialPlatform = z.infer<typeof socialPlatform>;

/** The canonical row order (design-out: IG · YT · TikTok · FB · website). */
export const SOCIAL_PLATFORM_ORDER: readonly SocialPlatform[] = socialPlatform.options;

export const setProfileLinksInput = z.object({
  profileId: z.string().uuid(),
  links: z
    .array(
      z.object({
        platform: socialPlatform,
        url: z.string().trim().url().max(500),
      }),
    )
    .max(socialPlatform.options.length)
    .refine(
      (links) => new Set(links.map((link) => link.platform)).size === links.length,
      "One link per platform",
    ),
});

export type SetProfileLinksInput = z.infer<typeof setProfileLinksInput>;
