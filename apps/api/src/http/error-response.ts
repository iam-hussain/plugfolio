import { AppError, type AppErrorCode } from "@plugfolio/core";
import { ZodError } from "zod";

/**
 * The single place typed domain errors map to HTTP status codes (§6.5) —
 * the API-side mirror of the web app's mapper, same wire shape.
 */
const statusByCode: Record<AppErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
};

export type ErrorShape = {
  status: 400 | 401 | 403 | 404 | 409 | 500;
  body: { error: { code: string; message: string; details?: unknown } };
};

export function toErrorShape(error: unknown): ErrorShape {
  if (error instanceof ZodError) {
    return {
      status: 400,
      body: { error: { code: "VALIDATION", message: "Invalid request", details: error.flatten() } },
    };
  }

  if (error instanceof AppError) {
    return {
      status: statusByCode[error.code] as ErrorShape["status"],
      body: { error: { code: error.code, message: error.message } },
    };
  }

  console.error("Unhandled error:", error);
  return { status: 500, body: { error: { code: "INTERNAL", message: "Something went wrong" } } };
}
