/**
 * Typed error hierarchy (CLAUDE.md §6.5). Services throw these; the HTTP layer
 * maps each `code` to a status in exactly one place. Never throw bare strings.
 */
import { ZodError } from "zod";

export type AppErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FORBIDDEN"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", details?: unknown) {
    super("NOT_FOUND", message, details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super("CONFLICT", message, details);
    this.name = "ConflictError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Sign in required", details?: unknown) {
    super("UNAUTHORIZED", message, details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Not allowed", details?: unknown) {
    super("FORBIDDEN", message, details);
    this.name = "ForbiddenError";
  }
}

/** Too many tries in the window — the guessable-secret guard (ADR-0024). */
export class RateLimitedError extends AppError {
  constructor(message = "Too many attempts — try again later", details?: unknown) {
    super("RATE_LIMITED", message, details);
    this.name = "RateLimitedError";
  }
}

/**
 * The single, framework-free mapping from a thrown error to an HTTP status +
 * wire body (§6.5). Each app adapts this to its own response object (Next's
 * `NextResponse.json`, Hono's `c.json`) — the *mapping* lives here only, so a
 * new error code is added in one place, not once per deployable.
 */
export type ErrorShape = {
  status: 400 | 401 | 403 | 404 | 409 | 429 | 500;
  body: { error: { code: string; message: string; details?: unknown } };
};

const statusByCode: Record<AppErrorCode, ErrorShape["status"]> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
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
      status: statusByCode[error.code],
      body: { error: { code: error.code, message: error.message } },
    };
  }
  console.error("Unhandled error:", error);
  return { status: 500, body: { error: { code: "INTERNAL", message: "Something went wrong" } } };
}
