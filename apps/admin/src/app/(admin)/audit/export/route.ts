import { csvResponse } from "@/lib/csv";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";

export async function GET(): Promise<Response> {
  await requireAdmin();
  const { rows } = await repositories.audit.search({}, { page: 1, pageSize: 10_000 });
  return csvResponse(
    "audit-log.csv",
    ["when", "admin", "action", "targetType", "targetId", "detail"],
    rows.map((r) => [r.createdAt, r.adminEmail, r.action, r.targetType, r.targetId, r.detail]),
  );
}
