import { z } from "zod";

/**
 * Boundary schemas for password auth (ADR-0012). Email is normalized here so
 * every flow (register, login, reset) agrees on the same key.
 */

const email = z.string().trim().toLowerCase().email();
const password = z.string().min(8, "At least 8 characters").max(100);

export const registerInput = z.object({ email, password });
export type RegisterInput = z.infer<typeof registerInput>;

export const credentialsInput = z.object({ email, password: z.string().min(1) });
export type CredentialsInput = z.infer<typeof credentialsInput>;

export const emailOnlyInput = z.object({ email });
export type EmailOnlyInput = z.infer<typeof emailOnlyInput>;

export const verifyEmailInput = z.object({ token: z.string().min(1) });
export type VerifyEmailInput = z.infer<typeof verifyEmailInput>;

export const resetPasswordInput = z.object({ token: z.string().min(1), password });
export type ResetPasswordInput = z.infer<typeof resetPasswordInput>;
