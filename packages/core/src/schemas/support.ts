import { z } from "zod";

/**
 * Support requests (docs/implementation/support.md): any visitor — signed in
 * or not — contacts the operators. Known issues are the enum; `other`
 * carries the unknown ones. Works signed-out on purpose: the top category is
 * "I lost access to my email", which means they can't sign in.
 */
export const supportCategory = z.enum([
  "lost_email_access",
  "change_email",
  "merge_accounts",
  "password_trouble",
  "username_conflict",
  "connection_trouble",
  "business_account",
  "collab_dispute",
  "delete_account",
  "other",
]);

export type SupportCategory = z.infer<typeof supportCategory>;

export const createSupportTicketInput = z.object({
  category: supportCategory,
  message: z.string().trim().min(1).max(2000),
  /** The REPLY address — the account email may be exactly what's broken. */
  contactEmail: z.string().trim().toLowerCase().email().max(200),
});

export type CreateSupportTicketInput = z.infer<typeof createSupportTicketInput>;
