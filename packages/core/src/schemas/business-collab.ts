import { z } from "zod";

/**
 * Boundary schemas (§6.4) for the business side. The actor is always the
 * verified session user — never accepted from the body. Budget is free text:
 * v1 handles no money (§2.3), so it's display-only.
 */

export const createBusinessInput = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(280),
  logoUrl: z.string().url().nullish(),
});

export type CreateBusinessInput = z.infer<typeof createBusinessInput>;

export const postRequirementInput = z.object({
  title: z.string().trim().min(1).max(120),
  brief: z.string().trim().min(1).max(1000),
  budget: z.string().trim().max(60).nullish(),
  deadline: z.coerce.date().nullish(),
});

export type PostRequirementInput = z.infer<typeof postRequirementInput>;

export const approachRequirementInput = z.object({
  requirementId: z.string().uuid(),
  profileId: z.string().uuid(),
  message: z.string().trim().min(1).max(1000),
});

export type ApproachRequirementInput = z.infer<typeof approachRequirementInput>;

export const requestCollabInput = z.object({
  profileId: z.string().uuid(),
  message: z.string().trim().min(1).max(1000),
});

export type RequestCollabInput = z.infer<typeof requestCollabInput>;

export const collabMessageInput = z.object({
  body: z.string().trim().min(1).max(1000),
});

export type CollabMessageInput = z.infer<typeof collabMessageInput>;
