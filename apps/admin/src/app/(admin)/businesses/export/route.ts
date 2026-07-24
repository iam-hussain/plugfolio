import type { NextRequest } from "next/server";
import { csvResponse } from "@/lib/csv";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";

export async function GET(request: NextRequest): Promise<Response> {
  await requireAdmin();
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const { rows } = await repositories.businesses.search(q, { page: 1, pageSize: 10_000 });
  return csvResponse(
    "businesses.csv",
    ["name", "description", "owner", "requirements", "collabs", "ownerSuspended", "created"],
    rows.map((r) => [
      r.name,
      r.description,
      r.ownerEmail,
      r.requirementCount,
      r.collabCount,
      r.ownerSuspendedAt,
      r.createdAt,
    ]),
  );
}
