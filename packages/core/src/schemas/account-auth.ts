import { z } from "zod";
import { memberHandle } from "./member-handle";

/**
 * Boundary schemas for password auth (ADR-0012, ADR-0024). Email is normalized
 * here so every flow (register, login, reset) agrees on the same key.
 */

const email = z.string().trim().toLowerCase().email();
const password = z.string().min(8, "At least 8 characters").max(100);
/** Login takes an email OR a member handle — same password either way (ADR-0024). */
const identifier = z.string().trim().toLowerCase().min(1);

export const registerInput = z.object({ email, password });
export type RegisterInput = z.infer<typeof registerInput>;

export const credentialsInput = z.object({ identifier, password: z.string().min(1) });
export type CredentialsInput = z.infer<typeof credentialsInput>;

/** Admin sign-in stays email-only — operators have no public handle to log in
 * with, and the admin app rate-limits per address (ADR-0014). */
export const adminCredentialsInput = z.object({ email, password: z.string().min(1) });
export type AdminCredentialsInput = z.infer<typeof adminCredentialsInput>;

export const identifierInput = z.object({ identifier });
export type IdentifierInput = z.infer<typeof identifierInput>;

export const emailOnlyInput = z.object({ email });
export type EmailOnlyInput = z.infer<typeof emailOnlyInput>;

/**
 * Verification is where the account gets its name (ADR-0024) — the username is
 * picked here, never assigned. Two ways to prove the inbox, both from the same
 * email: the link's token, or the six-digit code for someone who'd rather type
 * than leave the in-app browser and come back.
 */
export const verifyEmailInput = z.union([
  z.object({ token: z.string().min(1), username: memberHandle }),
  z.object({
    email,
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Six digits"),
    username: memberHandle,
  }),
]);
export type VerifyEmailInput = z.infer<typeof verifyEmailInput>;

export const resetPasswordInput = z.object({ token: z.string().min(1), password });
export type ResetPasswordInput = z.infer<typeof resetPasswordInput>;
