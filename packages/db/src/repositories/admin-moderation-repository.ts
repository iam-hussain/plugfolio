import { Prisma } from "@prisma/client";
import type {
  AdminCommentRow,
  AdminContentRepository,
  AdminPostRow,
  AdminProductRow,
  AdminProfileDetail,
  AdminProfileRepository,
  AdminProfileRow,
  Page,
  PageQuery,
  ProductCouponFilter,
  ProfileStatusFilter,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementations of the admin moderation ports (admin-app note). */

function skipTake(page: PageQuery) {
  return { skip: (page.page - 1) * page.pageSize, take: page.pageSize };
}

function profileStatusWhere(status: ProfileStatusFilter | undefined): Prisma.ProfileWhereInput {
  switch (status) {
    case "live":
      return { suspendedAt: null, user: { suspendedAt: null } };
    case "suspended":
      return { suspendedAt: { not: null } };
    case "owner-suspended":
      return { user: { suspendedAt: { not: null } } };
    default:
      return {};
  }
}

const profileSelect = {
  id: true,
  username: true,
  suspendedAt: true,
  createdAt: true,
  user: { select: { email: true, suspendedAt: true } },
  _count: { select: { managers: true, posts: true, products: true, followers: true } },
} as const;

type ProfileRow = Prisma.ProfileGetPayload<{ select: typeof profileSelect }>;

function toProfileRow({ user, _count, ...row }: ProfileRow): AdminProfileRow {
  return {
    ...row,
    ownerEmail: user.email,
    ownerSuspendedAt: user.suspendedAt,
    managerCount: _count.managers,
    postCount: _count.posts,
    productCount: _count.products,
    followerCount: _count.followers,
  };
}

export function createAdminProfileRepository(db: PrismaClient = prisma): AdminProfileRepository {
  return {
    async search(
      query: string | undefined,
      status: ProfileStatusFilter | undefined,
      page: PageQuery,
    ): Promise<Page<AdminProfileRow>> {
      const where: Prisma.ProfileWhereInput = {
        ...profileStatusWhere(status),
        ...(query
          ? {
              OR: [
                { username: { contains: query, mode: "insensitive" } },
                { user: { email: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {}),
      };
      const [rows, total] = await Promise.all([
        db.profile.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...skipTake(page),
          select: profileSelect,
        }),
        db.profile.count({ where }),
      ]);
      return { rows: rows.map(toProfileRow), total };
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

    async detail(profileId: string, since30: Date): Promise<AdminProfileDetail | null> {
      const row = await db.profile.findUnique({
        where: { id: profileId },
        select: {
          ...profileSelect,
          managers: {
            orderBy: { createdAt: "asc" },
            select: { createdAt: true, user: { select: { email: true } } },
          },
          categories: { orderBy: { sortOrder: "asc" }, select: { title: true } },
          posts: {
            orderBy: { createdAt: "desc" },
            take: 12,
            select: { id: true, mediaUrl: true, caption: true },
          },
          products: {
            orderBy: { createdAt: "desc" },
            select: { id: true, title: true, kind: true, couponCode: true },
          },
        },
      });
      if (!row) return null;

      const [taps30d, codeCopies30d, tapsByProduct] = await Promise.all([
        db.tap.count({ where: { profileId, occurredAt: { gte: since30 } } }),
        db.codeCopy.count({ where: { profileId, occurredAt: { gte: since30 } } }),
        db.tap.groupBy({
          by: ["productId"],
          where: { profileId, occurredAt: { gte: since30 } },
          _count: { _all: true },
        }),
      ]);
      const tapsFor = new Map(tapsByProduct.map((t) => [t.productId, t._count._all]));

      const { managers, categories, posts, products, ...base } = row;
      return {
        ...toProfileRow(base),
        managers: managers.map((m) => ({ email: m.user.email, since: m.createdAt })),
        categories: categories.map((c) => c.title),
        taps30d,
        codeCopies30d,
        posts,
        products: products.map((p) => ({ ...p, taps30d: tapsFor.get(p.id) ?? 0 })),
      };
    },
  };
}

export function createAdminContentRepository(db: PrismaClient = prisma): AdminContentRepository {
  return {
    async searchComments(
      query: string | undefined,
      limit: number,
    ): Promise<Page<AdminCommentRow>> {
      const where: Prisma.CommentWhereInput = query
        ? {
            OR: [
              { body: { contains: query, mode: "insensitive" } },
              { user: { username: { contains: query, mode: "insensitive" } } },
              { profile: { username: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {};
      const [rows, total] = await Promise.all([
        db.comment.findMany({
          where,
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
        }),
        db.comment.count({ where }),
      ]);
      return {
        rows: rows.map(({ user, asProfile, profile, product, _count, ...row }) => ({
          ...row,
          authorHandle: user.username,
          asProfileUsername: asProfile?.username ?? null,
          pageUsername: profile.username,
          productTitle: product?.title ?? null,
          replyCount: _count.replies,
        })),
        total,
      };
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

    async deleteCommentsBulk(commentIds: readonly string[]): Promise<number> {
      const { count } = await db.comment.deleteMany({ where: { id: { in: [...commentIds] } } });
      return count;
    },

    async searchPosts(query: string | undefined, page: PageQuery): Promise<Page<AdminPostRow>> {
      const where: Prisma.PostWhereInput = query
        ? {
            OR: [
              { caption: { contains: query, mode: "insensitive" } },
              { profile: { username: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {};
      const [rows, total] = await Promise.all([
        db.post.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...skipTake(page),
          select: {
            id: true,
            mediaUrl: true,
            caption: true,
            createdAt: true,
            profile: { select: { username: true } },
            _count: { select: { products: true } },
          },
        }),
        db.post.count({ where }),
      ]);
      return {
        rows: rows.map(({ profile, _count, ...row }) => ({
          ...row,
          username: profile.username,
          productCount: _count.products,
        })),
        total,
      };
    },

    async deletePost(postId: string): Promise<"ok" | "not_found"> {
      const { count } = await db.post.deleteMany({ where: { id: postId } });
      return count === 0 ? "not_found" : "ok";
    },

    async deletePostsBulk(postIds: readonly string[]): Promise<number> {
      const { count } = await db.post.deleteMany({ where: { id: { in: [...postIds] } } });
      return count;
    },

    async searchProducts(
      query: string | undefined,
      coupon: ProductCouponFilter | undefined,
      now: Date,
      page: PageQuery,
    ): Promise<Page<AdminProductRow>> {
      const where: Prisma.ProductWhereInput = {
        ...(coupon === "has-coupon" ? { couponCode: { not: null } } : {}),
        ...(coupon === "expired-coupon"
          ? { couponCode: { not: null }, offerEndsAt: { lt: now } }
          : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { profile: { username: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {}),
      };
      const [rows, total] = await Promise.all([
        db.product.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...skipTake(page),
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
        }),
        db.product.count({ where }),
      ]);
      return {
        rows: rows.map(({ profile, ...row }) => ({ ...row, username: profile.username })),
        total,
      };
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

    async deleteProductsBulk(productIds: readonly string[]): Promise<number> {
      const { count } = await db.product.deleteMany({ where: { id: { in: [...productIds] } } });
      return count;
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
