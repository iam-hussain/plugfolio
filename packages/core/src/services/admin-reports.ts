import { NotFoundError } from "../errors";
import type {
  AdminAuditRepository,
  AdminReportRepository,
  AdminReportRow,
  Page,
  PageQuery,
  ReportStatus,
} from "../ports/admin-repository";

/**
 * The reports triage queue (docs/design/admin-console-m2.md §3.2): users flag
 * content, admins resolve or dismiss. Resolving is a judgment record, not a
 * takedown — the takedown itself happens on the target's own screen and
 * carries its own audit entry.
 */

export type AdminReportsDeps = {
  reports: AdminReportRepository;
  audit: AdminAuditRepository;
  now: () => Date;
};

export async function listReports(
  deps: Pick<AdminReportsDeps, "reports">,
  status: ReportStatus | "all",
  page: PageQuery,
): Promise<Page<AdminReportRow>> {
  return deps.reports.list(status, page);
}

async function closeReport(
  deps: AdminReportsDeps,
  adminId: string,
  reportId: string,
  status: "resolved" | "dismissed",
): Promise<void> {
  const closed = await deps.reports.setStatus(reportId, status, deps.now());
  if (closed === "not_found") throw new NotFoundError("No such report");
  await deps.audit.record({
    adminId,
    action: status === "resolved" ? "report.resolve" : "report.dismiss",
    targetType: "report",
    targetId: reportId,
    detail: closed.snippet,
  });
}

export async function resolveReport(
  deps: AdminReportsDeps,
  adminId: string,
  reportId: string,
): Promise<void> {
  await closeReport(deps, adminId, reportId, "resolved");
}

export async function dismissReport(
  deps: AdminReportsDeps,
  adminId: string,
  reportId: string,
): Promise<void> {
  await closeReport(deps, adminId, reportId, "dismissed");
}
