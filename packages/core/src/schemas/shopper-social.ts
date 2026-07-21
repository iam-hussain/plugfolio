import { z } from "zod";

/**
 * Boundary schemas (§6.4) for the two shopper-account actions. The author's
 * identity is NEVER accepted from the body — it comes from the verified
 * session; these validate only what the client legitimately chooses.
 */

export const followProfileInput = z.object({
  profileId: z.string().uuid(),
});

export type FollowProfileInput = z.infer<typeof followProfileInput>;

export const addCommentInput = z.object({
  profileId: z.string().uuid(),
  /** The profile to speak AS (ADR-0009) — membership is verified in the service. */
  asProfileId: z.string().uuid().nullish(),
  body: z.string().trim().min(1, "Comment cannot be empty").max(500, "Max 500 characters"),
});

export type AddCommentInput = z.infer<typeof addCommentInput>;
