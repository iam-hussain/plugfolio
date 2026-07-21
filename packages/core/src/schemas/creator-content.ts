import { z } from "zod";

/**
 * Boundary schemas (§6.4) for the creator's back room. The actor is always
 * the verified session user; profile ownership is checked in the service.
 */

export const createPostInput = z.object({
  profileId: z.string().uuid(),
  mediaUrl: z.string().url(),
  caption: z.string().trim().max(500).nullish(),
});

export type CreatePostInput = z.infer<typeof createPostInput>;

export const tagProductInput = z.object({
  profileId: z.string().uuid(),
  postId: z.string().uuid(),
  /** The product page to grab title/image/price from. */
  url: z.string().url(),
  /** The creator's own affiliate destination (v1 handles no money, §2.3). */
  affiliateUrl: z.string().url(),
});

export type TagProductInput = z.infer<typeof tagProductInput>;

export const updateProductInput = z.object({
  affiliateUrl: z.string().url(),
});

export type UpdateProductInput = z.infer<typeof updateProductInput>;

// --- Categories (ADR-0010: per-profile shelves) ---

export const createCategoryInput = z.object({
  profileId: z.string().uuid(),
  title: z.string().trim().min(1, "Title cannot be empty").max(50, "Max 50 characters"),
  description: z.string().trim().max(200, "Max 200 characters").nullish(),
});

export type CreateCategoryInput = z.infer<typeof createCategoryInput>;

export const updateCategoryInput = z.object({
  title: z.string().trim().min(1).max(50).optional(),
  description: z.string().trim().max(200).nullish(),
  sortOrder: z.number().int().min(0).optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategoryInput>;

export const setPostCategoryInput = z.object({
  profileId: z.string().uuid(),
  categoryId: z.string().uuid().nullable(),
});

export type SetPostCategoryInput = z.infer<typeof setPostCategoryInput>;

export const setProductCategoryInput = z.object({
  categoryId: z.string().uuid().nullable(),
});

export type SetProductCategoryInput = z.infer<typeof setProductCategoryInput>;
