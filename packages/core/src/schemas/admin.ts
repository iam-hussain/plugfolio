import { z } from "zod";

/**
 * Admin-app inputs (docs/implementation/admin-app.md). The username shape
 * matches the member-handle slug rule — one grammar for every public name.
 */

export const releaseUsernameInput = z.object({
  profileId: z.string().uuid(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9._-]{2,29}$/, "3–30 characters: letters, numbers, dots, dashes"),
});

export type ReleaseUsernameInput = z.infer<typeof releaseUsernameInput>;
