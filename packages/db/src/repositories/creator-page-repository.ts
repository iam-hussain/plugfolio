import type {
  CreatorPage,
  CreatorPageReadRepository,
  ShopperPost,
  ShopperProduct,
  ShopperProductView,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

const productSelect = {
  id: true,
  title: true,
  imageUrl: true,
  priceCents: true,
  currency: true,
  kind: true,
  affiliateUrl: true,
  couponCode: true,
  offerEndsAt: true,
  inStoreNote: true,
  categoryId: true,
} as const;

/**
 * Prisma implementation of the `CreatorPageReadRepository` port — the read
 * side of the no-login shopper surface. Selects exactly the read-model shape
 * so nothing outside this file depends on Prisma rows.
 */
export function createCreatorPageRepository(db: PrismaClient = prisma): CreatorPageReadRepository {
  return {
    async findByUsername(username: string): Promise<CreatorPage | null> {
      return db.profile.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          categories: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: { id: true, title: true, description: true },
          },
          posts: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              mediaUrl: true,
              caption: true,
              categoryId: true,
              products: { select: productSelect },
            },
          },
        },
      });
    },

    async listProducts(username: string): Promise<readonly ShopperProduct[]> {
      return db.product.findMany({
        where: { profile: { username } },
        orderBy: { createdAt: "desc" },
        select: productSelect,
      });
    },

    async findPost(username: string, postId: string): Promise<ShopperPost | null> {
      // Scoped to the handle so /a/post/<id-of-b's-post> is a 404, not a leak.
      return db.post.findFirst({
        where: { id: postId, profile: { username } },
        select: {
          id: true,
          mediaUrl: true,
          caption: true,
          categoryId: true,
          products: { select: productSelect },
        },
      });
    },

    async findProduct(username: string, productId: string): Promise<ShopperProductView | null> {
      const product = await db.product.findFirst({
        where: { id: productId, profile: { username } },
        select: {
          ...productSelect,
          posts: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, mediaUrl: true },
          },
        },
      });
      if (!product) return null;
      const { posts, ...rest } = product;
      return { ...rest, fromPost: posts[0] ?? null };
    },
  };
}
