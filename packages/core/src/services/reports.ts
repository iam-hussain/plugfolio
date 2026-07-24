import { NotFoundError } from "../errors";
import type { ReportCategory, ReportTargetType } from "../ports/admin-repository";
import type { CreateReportInput } from "../schemas/report";

/**
 * The product-side report inflow (admin-console-m2 §3.2): a shopper flags a
 * comment/product/profile/post and it lands in the admin triage queue. The
 * snippet is captured from the target AT REPORT TIME so the queue keeps its
 * preview even after a takedown; unknown targets are rejected so random
 * uuids can't stuff the queue.
 */

export type NewReport = {
  targetType: ReportTargetType;
  targetId: string;
  category: ReportCategory;
  note: string | null;
  reporterLabel: string;
  snippet: string;
};

export type ReportWriteRepository = {
  /** One line describing the target now (comment body, product title, …). */
  resolveTargetSnippet(type: ReportTargetType, targetId: string): Promise<string | null>;
  create(report: NewReport): Promise<void>;
};

export type CreateReportDeps = {
  reports: ReportWriteRepository;
};

export async function createReport(
  deps: CreateReportDeps,
  input: CreateReportInput,
  reporter: { handle?: string | null },
): Promise<void> {
  const snippet = await deps.reports.resolveTargetSnippet(input.targetType, input.targetId);
  if (snippet === null) throw new NotFoundError("That content no longer exists");
  await deps.reports.create({
    targetType: input.targetType,
    targetId: input.targetId,
    category: input.category,
    note: input.note || null,
    reporterLabel: reporter.handle ? `@${reporter.handle}` : "Anonymous shopper",
    snippet,
  });
}
