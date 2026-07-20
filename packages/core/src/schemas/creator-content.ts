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
