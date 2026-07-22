import { Prisma } from "@prisma/client";
import type { CodeCopy, CodeCopyRepository, NewCodeCopy } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

const viewSelect = {
  id: true,
  productId: true,
  postId: true,
  profileId: true,
  occurredAt: true,
} as const;

/** Prisma implementation of the `CodeCopyRepository` port (ADR-0011). */
export function createCodeCopyRepository(db: PrismaClient = prisma): CodeCopyRepository {
  return {
    async append(copy: NewCodeCopy): Promise<CodeCopy> {
      try {
        return await db.codeCopy.create({ data: copy, select: viewSelect });
      } catch (error) {
        // Concurrent double-fire lost the insert race (§6.8) — return the winner.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          const existing = await db.codeCopy.findUnique({
            where: { idempotencyKey: copy.idempotencyKey },
            select: viewSelect,
          });
          if (existing) return existing;
        }
        throw error;
      }
    },

    async findByIdempotencyKey(key: string): Promise<CodeCopy | null> {
      return db.codeCopy.findUnique({ where: { idempotencyKey: key }, select: viewSelect });
    },
  };
}
