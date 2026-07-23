import type {
  ConnectionReadRepository,
  PostWriteRepository,
  ProductWriteRepository,
  SocialConnectionRepository,
  SocialProvider,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementations of the creator back-room write ports. */

export function createConnectionRepository(db: PrismaClient = prisma): ConnectionReadRepository {
  return {
    async hasAny(userId: string): Promise<boolean> {
      // Auth.js Account rows ARE the connected socials (ADR-0007).
      const count = await db.account.count({ where: { userId } });
      return count > 0;
    },
  };
}

export function createSocialConnectionRepository(
  db: PrismaClient = prisma,
): SocialConnectionRepository {
  return {
    async getTokens(userId: string, provider: SocialProvider) {
      const account = await db.account.findFirst({
        where: { userId, provider },
        select: { access_token: true, refresh_token: true, expires_at: true },
      });
      if (!account) return null;
      return {
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
        // Auth.js stores expires_at as epoch seconds.
        expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
      };
    },

    async updateTokens(userId, provider, tokens) {
      await db.account.updateMany({
        where: { userId, provider },
        data: {
          access_token: tokens.accessToken,
          ...(tokens.refreshToken ? { refresh_token: tokens.refreshToken } : {}),
          expires_at: tokens.expiresAt ? Math.floor(tokens.expiresAt.getTime() / 1000) : null,
        },
      });
    },
  };
}

export function createPostWriteRepository(db: PrismaClient = prisma): PostWriteRepository {
  return {
    async create(post): Promise<{ id: string }> {
      return db.post.create({ data: post, select: { id: true } });
    },

    async belongsToProfile(postId: string, profileId: string): Promise<boolean> {
      const count = await db.post.count({ where: { id: postId, profileId } });
      return count > 0;
    },

    async setCategory(postId: string, categoryId: string | null): Promise<void> {
      await db.post.update({ where: { id: postId }, data: { categoryId } });
    },
  };
}

export function createProductWriteRepository(db: PrismaClient = prisma): ProductWriteRepository {
  return {
    async createTagged(product): Promise<{ id: string }> {
      const { postId, ...data } = product;
      return db.product.create({
        data: { ...data, posts: { connect: { id: postId } } },
        select: { id: true },
      });
    },

    async updateAffiliateUrl(productId: string, affiliateUrl: string): Promise<void> {
      await db.product.update({ where: { id: productId }, data: { affiliateUrl } });
    },

    async setCategory(productId: string, categoryId: string | null): Promise<void> {
      await db.product.update({ where: { id: productId }, data: { categoryId } });
    },

    async updateCoupon(productId, coupon): Promise<void> {
      await db.product.update({ where: { id: productId }, data: coupon });
    },

    async remove(productId: string): Promise<void> {
      // Cascade removes its taps (earnings history for a deleted product goes
      // with the product — the profile-level totals rebuild without it).
      await db.product.delete({ where: { id: productId } });
    },
  };
}
