import { z } from "zod";

/**
 * Single Zod-checked env boundary (§6.9). Import `env` from here; never read
 * `process.env` elsewhere. Fails fast at boot if config is missing.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  // Secret that signs the anonymous device token (§6.7, ADR-0002).
  DEVICE_TOKEN_SECRET: z.string().min(32, "DEVICE_TOKEN_SECRET must be at least 32 chars"),
  // Auth.js session/token secret (ADR-0007).
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars"),
  // Sender for magic-link emails; transport itself lands with deployment.
  EMAIL_FROM: z.string().default("Plugfolio <login@plugfolio.local>"),
  // OAuth connects (ADR-0004: Google/YouTube + Meta/Instagram). Optional —
  // the providers are wired only when credentials exist.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Surface a readable failure at startup rather than a runtime NPE later.
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
