import type { NextRequest } from "next/server";
import { csvResponse } from "@/lib/csv";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";

export async function GET(request: NextRequest): Promise<Response> {
  await requireAdmin();
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const { rows } = await repositories.profiles.search(q, undefined, { page: 1, pageSize: 10_000 });
  return csvResponse(
    "profiles.csv",
    ["username", "owner", "posts", "products", "followers", "suspended", "ownerSuspended", "created"],
    rows.map((r) => [
      `/${r.username}`,
      r.ownerEmail,
      r.postCount,
      r.productCount,
      r.followerCount,
      r.suspendedAt,
      r.ownerSuspendedAt,
      r.createdAt,
    ]),
  );
}
