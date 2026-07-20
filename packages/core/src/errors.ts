/**
 * Typed error hierarchy (CLAUDE.md §6.5). Services throw these; the HTTP layer
 * maps each `code` to a status in exactly one place. Never throw bare strings.
 */

export type AppErrorCode =
  "VALIDATION" | "NOT_FOUND" | "CONFLICT" | "FORBIDDEN" | "UNAUTHORIZED" | "INTERNAL";

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

