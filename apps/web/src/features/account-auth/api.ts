import type {
  EmailOnlyInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "@plugfolio/core";

/**
 * Client calls for password auth (ADR-0012). Register/verify/reset are plain
 * REST on apps/api; LOGIN is not here — it goes through Auth.js's
 * signIn("credentials") so the session cookie is set properly.
 */

async function send(path: string, body: unknown): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(problem?.error?.message ?? "Request failed");
  }
}

export const registerAccount = (input: RegisterInput) => send("/api/account", input);
export const verifyEmail = (input: VerifyEmailInput) => send("/api/account/verify", input);
export const resendVerification = (input: EmailOnlyInput) =>
  send("/api/account/resend-verification", input);
export const requestPasswordReset = (input: EmailOnlyInput) =>
  send("/api/account/reset-request", input);
export const resetPassword = (input: ResetPasswordInput) => send("/api/account/reset", input);
