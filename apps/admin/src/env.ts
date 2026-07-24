import { z } from "zod";

/**
 * Single Zod-checked env boundary (§6.9). Import `env` from here; never read
 * `process.env` elsewhere. Fails fast at boot if config is missing.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  // Auth.js JWT session secret for the admin app (ADR-0014).
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars"),
  // Where member-facing email links land (verify/reset ride the product web).
  WEB_ORIGIN: z.string().url().default("http://localhost:7077"),
  // Where operator set-password links land (this app).
  ADMIN_ORIGIN: z.string().url().default("http://localhost:7078"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Surface a readable failure at startup rather than a runtime NPE later.
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
