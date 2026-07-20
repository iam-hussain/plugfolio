import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

/**
 * No-login shopper identity (§6.7, ADR-0002): a signed, HTTP-only device token
 * — NOT an account row. The cookie value is `<deviceId>.<hmac>`; the server
 * verifies the signature and only ever trusts a `deviceId` it signed itself.
 * Anonymous by default; issuing a token creates no user record.
 *
 * Lives in core (not an app) so both deployables share one implementation
 * (ADR-0008); the secret is a parameter — core never reads env (§6.9).
 */
export const DEVICE_COOKIE = "pf_device";

function signatureFor(secret: string, deviceId: string): string {
  return createHmac("sha256", secret).update(deviceId).digest("base64url");
}

/** Returns the verified deviceId, or null if the token is missing/forged. */
export function verifyDeviceToken(secret: string, token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const deviceId = token.slice(0, dot);
  const provided = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(signatureFor(secret, deviceId));

  // Constant-time compare; bail before timingSafeEqual if lengths differ (it throws).
  if (provided.length !== expected.length) return null;
  return timingSafeEqual(provided, expected) ? deviceId : null;
}

/** Mint a fresh identity + its signed token, for setting a new device cookie. */
export function issueDeviceToken(secret: string): { deviceId: string; token: string } {
  const deviceId = randomUUID();
  return { deviceId, token: `${deviceId}.${signatureFor(secret, deviceId)}` };
}
