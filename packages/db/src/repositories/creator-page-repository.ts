import type {
  CreatorPage,
  CreatorPageReadRepository,
  CreatorProductRow,
  ShopperPost,
  ShopperProductView,
} from "@plugfolio/core";
import { PAGE_APPEARANCE_DEFAULTS } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";
import { resolveCoverStyle } from "@plugfolio/core";
import { readAppearance, readMediaKind } from "../page-appearance";

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

/** Admin suspension (docs/implementation/admin-app.md): a suspended profile —
 * or any profile of a suspended account — is off every public read (404). */
// Mongo (Prisma): `{ field: null }` does NOT match an absent optional — a
// never-suspended profile has no `suspendedAt` at all — so match on unset.
const liveProfile = {
  suspendedAt: { isSet: false },
  user: { suspendedAt: { isSet: false } },
} as const;

/**
 * Prisma implementation of the `CreatorPageReadRepository` port — the read
 * side of the no-login shopper surface. Selects exactly the read-model shape
 * so nothing outside this file depends on Prisma rows.
 */
export function createCreatorPageRepository(db: PrismaClient = prisma): CreatorPageReadRepository {
  return {
    async findByUsername(username: string): Promise<CreatorPage | null> {
      const row = await db.profile.findFirst({
        where: { username, ...liveProfile },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          coverUrl: true,
          accent: true,
          headerStyle: true,
          gridStyle: true,
          coverStyle: true,
          linkMode: true,
          greeting: true,
          _count: { select: { followers: true } },
          categories: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: { id: true, title: true, description: true },
          },
          posts: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              mediaUrl: true,
              mediaKind: true,
              embedUrl: true,
              sourceUrl: true,
              caption: true,
              categoryId: true,
              hiddenAt: true,
              products: { select: productSelect },
            },
          },
        },
      });
      if (!row) return null;
      const { _count, accent, headerStyle, gridStyle, coverStyle, linkMode, greeting, ...page } =
        row;
      // Resolve the defaults once here (ADR-0017) so no component downstream
      // has to know what a default is.
      const look = readAppearance({ accent, headerStyle, gridStyle, coverStyle, linkMode, greeting });
      const resolvedHeader = look.headerStyle ?? PAGE_APPEARANCE_DEFAULTS.headerStyle;
      return {
        ...page,
        posts: page.posts.map((post) => ({ ...post, mediaKind: readMediaKind(post.mediaKind) })),
        greeting: look.greeting,
        accent: look.accent ?? PAGE_APPEARANCE_DEFAULTS.accent,
        headerStyle: resolvedHeader,
        gridStyle: look.gridStyle ?? PAGE_APPEARANCE_DEFAULTS.gridStyle,
        coverStyle: resolveCoverStyle(look.coverStyle, resolvedHeader),
        linkMode: look.linkMode ?? PAGE_APPEARANCE_DEFAULTS.linkMode,
        followerCount: _count.followers,
      };
    },

    async listProducts(username: string): Promise<readonly CreatorProductRow[]> {
      const rows = await db.product.findMany({
        where: { profile: { username, ...liveProfile } },
        orderBy: { createdAt: "desc" },
        select: { ...productSelect, sourceUrl: true, _count: { select: { posts: true } } },
      });
      return rows.map(({ _count, ...product }) => ({ ...product, postCount: _count.posts }));
    },

    async findPost(username: string, postId: string): Promise<ShopperPost | null> {
      // Scoped to the handle so /a/post/<id-of-b's-post> is a 404, not a leak.
      const post = await db.post.findFirst({
        where: { id: postId, profile: { username, ...liveProfile } },
        select: {
          id: true,
          mediaUrl: true,
          mediaKind: true,
          embedUrl: true,
          sourceUrl: true,
          caption: true,
          categoryId: true,
          hiddenAt: true,
          products: { select: productSelect },
        },
      });
      return post === null ? null : { ...post, mediaKind: readMediaKind(post.mediaKind) };
    },

    async findProduct(username: string, productId: string): Promise<ShopperProductView | null> {
      const product = await db.product.findFirst({
        where: { id: productId, profile: { username, ...liveProfile } },
        select: {
          ...productSelect,
          profileId: true,
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
