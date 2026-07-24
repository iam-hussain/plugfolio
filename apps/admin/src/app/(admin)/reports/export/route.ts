import { csvResponse } from "@/lib/csv";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";

export async function GET(): Promise<Response> {
  await requireAdmin();
  const { rows } = await repositories.reports.list("all", { page: 1, pageSize: 10_000 });
  return csvResponse(
    "reports.csv",
    ["targetType", "snippet", "category", "note", "reporter", "status", "created", "resolved"],
    rows.map((r) => [
      r.targetType,
      r.snippet,
      r.category,
      r.note,
      r.reporterLabel,
      r.status,
      r.createdAt,
      "",
    ]),
  );
}
