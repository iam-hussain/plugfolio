"use server";

import { signIn } from "@/server/auth";

/**
 * Starts the Google OAuth connect (ADR-0004). Runs with the creator already
 * signed in by email+password, so Auth.js links the resulting Account row to
 * the current user — a connection, not a login.
 */
export async function connectGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/dashboard" });
}
