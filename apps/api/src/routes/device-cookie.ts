import { setCookie } from "hono/cookie";
import { DEVICE_COOKIE } from "@plugfolio/core";
import type { Context } from "hono";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Persist a freshly-issued anonymous device token (ADR-0002). The attribution
 * writes and the account-free intake (reports/support) all mint the same cookie
 * the same way — httpOnly + secure + Lax, a year long — so the policy lives here
 * once instead of being pasted at each call site.
 */
export function setDeviceCookie(c: Context, issued: { token: string } | null): void {
  if (!issued) return;
  setCookie(c, DEVICE_COOKIE, issued.token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}
