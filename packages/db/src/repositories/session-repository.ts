import { prisma, type PrismaClient } from "../client";

/**
 * Session lookup for the standalone API (ADR-0008). Auth.js (in apps/web) owns
 * sign-in and writes database sessions; the API verifies a request by resolving
 * the session-token cookie against the same Session table — no Auth.js runtime
 * needed on the API side.
 */
export function createSessionRepository(db: PrismaClient = prisma) {
  return {
    async findUserIdBySessionToken(sessionToken: string): Promise<string | null> {
      const row = await db.session.findUnique({
        where: { sessionToken },
        select: { userId: true, expires: true },
      });
      if (!row || row.expires <= new Date()) return null;
      return row.userId;
    },
  };
}
