import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { env } from "@/env";

/**
 * No-login shopper identity (§6.7, ADR-0002): a signed, HTTP-only device token
 * — NOT an account row. The cookie value is `<deviceId>.<hmac>`; the server
 * verifies the signature and only ever trusts a `deviceId` it signed itself.
 * Anonymous by default; issuing a token creates no user record.
 */
export const DEVICE_COOKIE = "pf_device";

function signatureFor(deviceId: string): string {
  return createHmac("sha256", env.DEVICE_TOKEN_SECRET).update(deviceId).digest("base64url");
}

/** Returns the verified deviceId, or null if the token is missing/forged. */
export function verifyDeviceToken(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const deviceId = token.slice(0, dot);
  const provided = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(signatureFor(deviceId));

  // Constant-time compare; bail before timingSafeEqual if lengths differ (it throws).
  if (provided.length !== expected.length) return null;
  return timingSafeEqual(provided, expected) ? deviceId : null;
}

/** Mint a fresh identity + its signed token, for setting a new device cookie. */
export function issueDeviceToken(): { deviceId: string; token: string } {
  const deviceId = randomUUID();
  return { deviceId, token: `${deviceId}.${signatureFor(deviceId)}` };
}
