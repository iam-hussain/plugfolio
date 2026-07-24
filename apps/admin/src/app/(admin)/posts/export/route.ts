import type { NextRequest } from "next/server";
import { csvResponse } from "@/lib/csv";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";

export async function GET(request: NextRequest): Promise<Response> {
  await requireAdmin();
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const { rows } = await repositories.content.searchPosts(q, { page: 1, pageSize: 10_000 });
  return csvResponse(
    "posts.csv",
    ["caption", "profile", "mediaUrl", "products", "created"],
    rows.map((r) => [r.caption, `/${r.username}`, r.mediaUrl, r.productCount, r.createdAt]),
  );
}
