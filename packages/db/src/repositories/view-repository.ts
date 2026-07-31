import { Prisma } from "../../generated/client";
import type { NewView, View, ViewRepository, ViewTargetRepository } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

const rowSelect = {
  id: true,
  profileId: true,
  postId: true,
  productId: true,
  surface: true,
  occurredAt: true,
} as const;

/** Prisma implementation of the `ViewRepository` port. */
export function createViewRepository(db: PrismaClient = prisma): ViewRepository {
  return {
    async append(view: NewView): Promise<View> {
      try {
        return await db.view.create({ data: view, select: rowSelect });
      } catch (error) {
        // Concurrent double-fire lost the insert race (§6.8) — return the winner.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          const existing = await db.view.findUnique({
            where: { idempotencyKey: view.idempotencyKey },
            select: rowSelect,
          });
          if (existing) return existing;
        }
        throw error;
      }
    },

    async findByIdempotencyKey(key: string): Promise<View | null> {
      return db.view.findUnique({ where: { idempotencyKey: key }, select: rowSelect });
    },
  };
}

/** Resolves an opened surface to the profile it belongs to. */
export function createViewTargetRepository(db: PrismaClient = prisma): ViewTargetRepository {
  return {
    async profileIdForUsername(username: string) {
      const profile = await db.profile.findUnique({ where: { username }, select: { id: true } });
      return profile?.id ?? null;
    },
    async profileIdForPost(postId: string) {
      const post = await db.post.findUnique({ where: { id: postId }, select: { profileId: true } });
      return post?.profileId ?? null;
    },
    async profileIdForProduct(productId: string) {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { profileId: true },
      });
      return product?.profileId ?? null;
    },
  };
}
