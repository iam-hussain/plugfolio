import { toErrorShape } from "@plugfolio/core";
import { NextResponse } from "next/server";

/**
 * Adapts the framework-free core error mapper (§6.5) to a Next `Response`. The
 * status/code mapping itself lives once in `@plugfolio/core`; this only wraps
 * the shape in `NextResponse.json` for web route handlers.
 */
export function toErrorResponse(error: unknown): NextResponse {
  const { status, body } = toErrorShape(error);
  return NextResponse.json(body, { status });
}
