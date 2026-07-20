import type { ProductForAttribution, ProductReadRepository } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/**
 * Prisma implementation of the `ProductReadRepository` port. Selects only the
 * attribution-relevant slice so the service can derive `profileId` from the
 * product (§6.6) without loading the whole row.
 */
export function createProductRepository(db: PrismaClient = prisma): ProductReadRepository {
  return {
    async findForAttribution(productId: string): Promise<ProductForAttribution | null> {
      return db.product.findUnique({
        where: { id: productId },
        select: { id: true, profileId: true },
      });
    },

    async isTaggedToPost(productId: string, postId: string): Promise<boolean> {
      const count = await db.post.count({
        where: { id: postId, products: { some: { id: productId } } },
      });
      return count > 0;
    },
  };
}
