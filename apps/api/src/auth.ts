import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { DEVICE_COOKIE, UnauthorizedError, issueDeviceToken, verifyDeviceToken } from "@plugfolio/core";
import { env } from "./env";
import { repositories } from "./container";

/**
 * Request identity for the API (ADR-0008). Auth.js in apps/web owns sign-in
 * and writes database sessions; here a request is verified by resolving the
 * session-token cookie against the Session table. The anonymous shopper
 * identity is the signed device cookie (§6.7, ADR-0002) — same secret as the
 * web app, so tokens verify on both deployables.
 */

// Auth.js v5 cookie names (secure-prefixed variant on HTTPS).
const SESSION_COOKIES = ["__Secure-authjs.session-token", "authjs.session-token"];

export async function sessionUserId(c: Context): Promise<string | null> {
  for (const name of SESSION_COOKIES) {
    const token = getCookie(c, name);
    if (token) return repositories.sessions.findUserIdBySessionToken(token);
  }
  return null;
}

export async function requireUserId(c: Context): Promise<string> {
  const userId = await sessionUserId(c);
  if (!userId) throw new UnauthorizedError();
  return userId;
}

/** Verified anonymous device identity; mints a fresh one if absent/forged. */
export function deviceIdentity(c: Context): {
  deviceId: string;
  issued: { deviceId: string; token: string } | null;
} {
  const verified = verifyDeviceToken(env.DEVICE_TOKEN_SECRET, getCookie(c, DEVICE_COOKIE));
  if (verified) return { deviceId: verified, issued: null };
  const issued = issueDeviceToken(env.DEVICE_TOKEN_SECRET);
  return { deviceId: issued.deviceId, issued };
}
