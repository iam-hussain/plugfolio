import { z } from "zod";

/**
 * Boundary schema for a sponsored placement (ADR-0020). Operator input, so it
 * is still parsed: an admin typing a bad URL should get a validation error, not
 * a slot that sends shoppers nowhere.
 */
export const createAdPlacementInput = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(160).nullish(),
  imageUrl: z.string().trim().url().max(500).nullish(),
  url: z.string().trim().url().max(500),
  activeFrom: z.coerce.date().optional(),
  /** Unset = runs until an operator stops it. */
  activeUntil: z.coerce.date().nullish(),
});

export type CreateAdPlacementInput = z.infer<typeof createAdPlacementInput>;
