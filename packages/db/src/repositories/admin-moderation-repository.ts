import { Prisma } from "@prisma/client";
import type {
  AdminCommentRow,
  AdminContentRepository,
  AdminPostRow,
  AdminProductRow,
  AdminProfileRepository,
  AdminProfileRow,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementations of the admin moderation ports (admin-app note). */

export function createAdminProfileRepository(db: PrismaClient = prisma): AdminProfileRepository {
  return {
    async search(query: string | undefined, limit: number): Promise<readonly AdminProfileRow[]> {
      const rows = await db.profile.findMany({
        where: query
          ? {
              OR: [
                { username: { contains: query, mode: "insensitive" } },
                { user: { email: { contains: query, mode: "insensitive" } } },
              ],
            }
          : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          username: true,
          suspendedAt: true,
          createdAt: true,
          user: { select: { email: true, suspendedAt: true } },
          _count: { select: { managers: true, posts: true, products: true, followers: true } },
        },
      });
      return rows.map(({ user, _count, ...row }) => ({
        ...row,
        ownerEmail: user.email,
        ownerSuspendedAt: user.suspendedAt,
        managerCount: _count.managers,
        postCount: _count.posts,
        productCount: _count.products,
        followerCount: _count.followers,
      }));
    },

    async setSuspended(profileId: string, at: Date | null): Promise<"ok" | "not_found"> {
      const { count } = await db.profile.updateMany({
        where: { id: profileId },
        data: { suspendedAt: at },
      });
      return count === 0 ? "not_found" : "ok";
    },

    async setUsername(
      profileId: string,
      username: string,
    ): Promise<{ previous: string } | "not_found" | "taken"> {
      try {
        // Interactive read-then-write so the audit gets the released name.
        return await db.$transaction(async (tx) => {
          const current = await tx.profile.findUnique({
            where: { id: profileId },
            select: { username: true },
          });
          if (!current) return "not_found";
          await tx.profile.update({ where: { id: profileId }, data: { username } });
          return { previous: current.username };
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return "taken";
        }
        throw error;
      }
    },
  };
}

export function createAdminContentRepository(db: PrismaClient = prisma): AdminContentRepository {
  return {
    async searchComments(
      query: string | undefined,
      limit: number,
    ): Promise<readonly AdminCommentRow[]> {
      const rows = await db.comment.findMany({
        where: query
          ? {
              OR: [
                { body: { contains: query, mode: "insensitive" } },
                { user: { username: { contains: query, mode: "insensitive" } } },
                { profile: { username: { contains: query, mode: "insensitive" } } },
              ],
            }
          : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          body: true,
          createdAt: true,
          user: { select: { username: true } },
          asProfile: { select: { username: true } },
          profile: { select: { username: true } },
          product: { select: { title: true } },
          _count: { select: { replies: true } },
        },
      });
      return rows.map(({ user, asProfile, profile, product, _count, ...row }) => ({
        ...row,
        authorHandle: user.username,
        asProfileUsername: asProfile?.username ?? null,
        pageUsername: profile.username,
        productTitle: product?.title ?? null,
        replyCount: _count.replies,
      }));
    },

    async deleteComment(commentId: string): Promise<{ body: string } | "not_found"> {
      try {
        const deleted = await db.comment.delete({
          where: { id: commentId },
          select: { body: true },
        });
        return { body: deleted.body };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          return "not_found";
        }
        throw error;
      }
    },

    async searchPosts(query: string | undefined, limit: number): Promise<readonly AdminPostRow[]> {
      const rows = await db.post.findMany({
        where: query
          ? {
              OR: [
                { caption: { contains: query, mode: "insensitive" } },
                { profile: { username: { contains: query, mode: "insensitive" } } },
              ],
            }
          : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          mediaUrl: true,
          caption: true,
          createdAt: true,
          profile: { select: { username: true } },
          _count: { select: { products: true } },
        },
      });
      return rows.map(({ profile, _count, ...row }) => ({
        ...row,
        username: profile.username,
        productCount: _count.products,
      }));
    },

    async deletePost(postId: string): Promise<"ok" | "not_found"> {
      const { count } = await db.post.deleteMany({ where: { id: postId } });
      return count === 0 ? "not_found" : "ok";
    },

    async searchProducts(
      query: string | undefined,
      limit: number,
    ): Promise<readonly AdminProductRow[]> {
      const rows = await db.product.findMany({
        where: query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { profile: { username: { contains: query, mode: "insensitive" } } },
              ],
            }
          : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          kind: true,
          affiliateUrl: true,
          couponCode: true,
          offerEndsAt: true,
          priceCents: true,
          currency: true,
          createdAt: true,
          profile: { select: { username: true } },
        },
      });
      return rows.map(({ profile, ...row }) => ({ ...row, username: profile.username }));
    },

    async deleteProduct(productId: string): Promise<{ title: string } | "not_found"> {
      try {
        const deleted = await db.product.delete({
          where: { id: productId },
          select: { title: true },
        });
        return { title: deleted.title };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          return "not_found";
        }
        throw error;
      }
    },

    async clearCoupon(productId: string): Promise<"ok" | "not_found"> {
      const { count } = await db.product.updateMany({
        where: { id: productId },
        data: { couponCode: null, offerEndsAt: null, inStoreNote: null },
      });
      return count === 0 ? "not_found" : "ok";
    },
  };
}
