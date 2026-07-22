import { Prisma } from "@prisma/client";
import type {
  AuthAccount,
  AuthAccountRepository,
  AuthTokenRepository,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementations of the password-auth ports (ADR-0012). */

export function createAuthAccountRepository(db: PrismaClient = prisma): AuthAccountRepository {
  return {
    async findByEmail(email: string): Promise<AuthAccount | null> {
      return db.user.findUnique({
        where: { email },
        select: { id: true, passwordHash: true, emailVerified: true },
      });
    },

    async createWithPassword(account): Promise<{ id: string } | "exists"> {
      try {
        return await db.user.create({ data: account, select: { id: true } });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return "exists";
        }
        throw error;
      }
    },

    async setPassword(userId: string, passwordHash: string): Promise<void> {
      // The link that led here proved the inbox — verify as a side effect
      // (covers the invited-Manager first password, ADR-0012).
      await db.user.update({
        where: { id: userId },
        data: { passwordHash, emailVerified: new Date() },
      });
    },

    async markVerified(userId: string): Promise<void> {
      await db.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
    },
  };
}

/** Rides the Auth.js VerificationToken table; `token` holds the sha256 HASH. */
export function createAuthTokenRepository(db: PrismaClient = prisma): AuthTokenRepository {
  return {
    async create(identifier: string, tokenHash: string, expires: Date): Promise<void> {
      await db.verificationToken.create({ data: { identifier, token: tokenHash, expires } });
    },

    async consume(tokenHash: string): Promise<{ identifier: string } | null> {
      const row = await db.verificationToken.findFirst({
        where: { token: tokenHash },
        select: { identifier: true, token: true, expires: true },
      });
      if (!row) return null;
      // Single-use either way; expired tokens die on touch.
      await db.verificationToken.delete({
        where: { identifier_token: { identifier: row.identifier, token: row.token } },
      });
      if (row.expires.getTime() < Date.now()) return null;
      return { identifier: row.identifier };
    },
  };
}
