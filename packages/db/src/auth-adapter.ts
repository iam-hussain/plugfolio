import { PrismaAdapter } from "@auth/prisma-adapter";
import { generateMemberHandle } from "@plugfolio/core";
import { prisma } from "./client";

type Adapter = ReturnType<typeof PrismaAdapter>;
type AdapterUser = Parameters<NonNullable<Adapter["createUser"]>>[0];

/**
 * Auth.js adapter over the shared Prisma client (ADR-0007). Lives here so
 * Prisma stays inside @plugfolio/db (§6.2) — the web app wires this into
 * NextAuth at its composition root without touching Prisma itself.
 *
 * createUser is wrapped so every account gets its member handle at first
 * sign-in (ADR-0009) — sign-up stays one step; the handle is changeable later.
 */
export function createAuthAdapter(): Adapter {
  const adapter = PrismaAdapter(prisma);
  return {
    ...adapter,
    createUser(user: AdapterUser) {
      const withHandle = { ...user, username: generateMemberHandle() };
      // The extra field is real on our User model; the adapter type just
      // doesn't know it.
      return adapter.createUser!(withHandle as AdapterUser);
    },
  };
}
