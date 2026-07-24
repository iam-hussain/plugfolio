import type { NextRequest } from "next/server";
import { csvResponse } from "@/lib/csv";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";

/** CSV dump of the (filtered) member list — newest 10k rows. */
export async function GET(request: NextRequest): Promise<Response> {
  await requireAdmin();
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const { rows } = await repositories.members.search(q, undefined, { page: 1, pageSize: 10_000 });
  return csvResponse(
    "members.csv",
    ["email", "handle", "name", "verified", "suspended", "profiles", "business", "joined"],
    rows.map((r) => [
      r.email,
      `@${r.username}`,
      r.name,
      r.emailVerified,
      r.suspendedAt,
      r.profileCount,
      r.hasBusiness,
      r.createdAt,
    ]),
  );
}
