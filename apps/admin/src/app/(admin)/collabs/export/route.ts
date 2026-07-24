import type { NextRequest } from "next/server";
import { csvResponse } from "@/lib/csv";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";

export async function GET(request: NextRequest): Promise<Response> {
  await requireAdmin();
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const { rows } = await repositories.collabs.list(q, { page: 1, pageSize: 10_000 });
  return csvResponse(
    "collabs.csv",
    ["business", "creator", "source", "messages", "businessAgreed", "creatorAgreed", "started"],
    rows.map((r) => [
      r.businessName,
      `/${r.profileUsername}`,
      r.requirementTitle ?? "Direct reach-out",
      r.messageCount,
      r.businessAgreedAt,
      r.creatorAgreedAt,
      r.createdAt,
    ]),
  );
}
