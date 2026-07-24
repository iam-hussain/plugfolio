import type { NextRequest } from "next/server";
import { csvResponse } from "@/lib/csv";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";

export async function GET(request: NextRequest): Promise<Response> {
  await requireAdmin();
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const { rows } = await repositories.content.searchComments(q, 10_000);
  return csvResponse(
    "comments.csv",
    ["body", "author", "speaksAs", "page", "product", "replies", "created"],
    rows.map((r) => [
      r.body,
      `@${r.authorHandle}`,
      r.asProfileUsername ? `/${r.asProfileUsername}` : "",
      `/${r.pageUsername}`,
      r.productTitle,
      r.replyCount,
      r.createdAt,
    ]),
  );
}
