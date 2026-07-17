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
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Surface a readable failure at startup rather than a runtime NPE later.
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
