import { z } from "zod";

/**
 * The member handle (ADR-0009): public identity only, never a login. Free-form
 * within a slug shape — handles have no URL in v1, so squatting gains nothing.
 */

export const updateMemberHandleInput = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9._-]{2,29}$/, "3–30 characters: letters, numbers, dots, dashes"),
});

export type UpdateMemberHandleInput = z.infer<typeof updateMemberHandleInput>;
