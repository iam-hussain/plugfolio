import { AppError, type AppErrorCode } from "@plugfolio/core";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * The single place typed domain errors map to HTTP status codes (§6.5). Route
 * handlers wrap their logic and delegate failures here — one mapping, not
 * scattered try/catch shapes.
 */
const statusByCode: Record<AppErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
};

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Invalid request", details: error.flatten() } },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: statusByCode[error.code] },
    );
  }

  console.error("Unhandled error:", error);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Something went wrong" } },
    { status: 500 },
  );
}
