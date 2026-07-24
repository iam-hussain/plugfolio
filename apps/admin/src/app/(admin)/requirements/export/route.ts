import type { NextRequest } from "next/server";
import { csvResponse } from "@/lib/csv";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";

export async function GET(request: NextRequest): Promise<Response> {
  await requireAdmin();
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const { rows } = await repositories.requirements.search(q, { page: 1, pageSize: 10_000 });
  return csvResponse(
    "requirements.csv",
    ["title", "brief", "business", "budget", "deadline", "approaches", "created"],
    rows.map((r) => [r.title, r.brief, r.businessName, r.budget, r.deadline, r.collabCount, r.createdAt]),
  );
}
