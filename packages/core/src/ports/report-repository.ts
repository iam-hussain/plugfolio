import type { ReportCategory, ReportTargetType } from "./admin-repository";

/**
 * Port for the product-side report inflow (admin-console-m2 §3.2): the write
 * half of the admin triage queue. The Prisma implementation lives in
 * `@plugfolio/db` (§6.2 repository pattern). The snippet is captured from the
 * target AT REPORT TIME so the queue keeps its preview even after a takedown.
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
