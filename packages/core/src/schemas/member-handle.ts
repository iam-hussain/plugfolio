import { z } from "zod";

/**
 * The member handle (ADR-0009, amended by ADR-0024): the account's public
 * identity, chosen at verification and usable as a login. Free-form within a
 * slug shape — handles have no URL in v1, so squatting gains nothing.
 */

/** The one handle shape — reused wherever a handle is claimed (settings, and
 * the verification screen where a new account picks its own, ADR-0024). */
export const memberHandle = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9._-]{2,29}$/, "3–30 characters: letters, numbers, dots, dashes");

export const updateMemberHandleInput = z.object({ username: memberHandle });

export type UpdateMemberHandleInput = z.infer<typeof updateMemberHandleInput>;

/** The member's picture — an uploaded (avatar-kind) URL, or null to clear. */
export const updateMemberImageInput = z.object({
  imageUrl: z.string().trim().url().max(500).nullable(),
});
export type UpdateMemberImageInput = z.infer<typeof updateMemberImageInput>;
