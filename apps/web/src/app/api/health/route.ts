import { NextResponse } from "next/server";

/**
 * GET /api/health — liveness probe. Deliberately DB-free so it stays green even
 * when the database is unreachable; it reports that the app process is up and
 * serving. A deeper readiness check (DB ping) can land separately if needed.
 */
export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  return NextResponse.json({ status: "ok" });
}
