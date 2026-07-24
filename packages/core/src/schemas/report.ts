import { z } from "zod";

/**
 * Reporting (docs/implementation/admin-app.md): any shopper can flag content
 * — no account required, same as shopping. The report feeds the admin
 * triage queue.
 */

export const createReportInput = z.object({
  targetType: z.enum(["comment", "product", "profile", "post"]),
  targetId: z.string().uuid(),
  category: z.enum(["spam", "scam", "offensive", "impersonation", "other"]),
  note: z.string().trim().max(500).optional(),
});

export type CreateReportInput = z.infer<typeof createReportInput>;
