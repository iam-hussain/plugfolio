import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./client";

/**
 * Auth.js adapter over the shared Prisma client (ADR-0007). Lives here so
 * Prisma stays inside @plugfolio/db (§6.2) — the web app wires this into
 * NextAuth at its composition root without touching Prisma itself.
 */
export function createAuthAdapter(): ReturnType<typeof PrismaAdapter> {
  return PrismaAdapter(prisma);
}
