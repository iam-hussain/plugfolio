import type { NextRequest } from "next/server";
import { csvResponse } from "@/lib/csv";
import { requireAdmin } from "@/server/auth";
import { clock, repositories } from "@/server/container";

export async function GET(request: NextRequest): Promise<Response> {
  await requireAdmin();
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const { rows } = await repositories.content.searchProducts(q, undefined, clock.now(), {
    page: 1,
    pageSize: 10_000,
  });
  return csvResponse(
    "products.csv",
    ["title", "profile", "kind", "priceCents", "currency", "coupon", "offerEndsAt", "outboundUrl", "created"],
    rows.map((r) => [
      r.title,
      `/${r.username}`,
      r.kind,
      r.priceCents,
      r.currency,
      r.couponCode,
      r.offerEndsAt,
      r.affiliateUrl,
      r.createdAt,
    ]),
  );
}
