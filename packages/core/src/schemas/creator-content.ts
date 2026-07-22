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

/** ADR-0011: whose product the card is — changes labels, never the buy model. */
export const productKind = z.enum(["affiliate", "own"]);

export type ProductKind = z.infer<typeof productKind>;

/** ADR-0011 channel rule: a product needs an outbound link, or a coupon with
 * an in-store note (in-store-only: no Buy button, the code IS the buy path). */
function hasAChannel(input: {
  affiliateUrl?: string | undefined;
  couponCode?: string | undefined;
  inStoreNote?: string | undefined;
}): boolean {
  if (input.couponCode) return Boolean(input.affiliateUrl || input.inStoreNote);
  return Boolean(input.affiliateUrl);
}

export const tagProductInput = z
  .object({
    profileId: z.string().uuid(),
    postId: z.string().uuid(),
    /** The product page to grab title/image/price from. */
    url: z.string().url(),
    kind: productKind.default("affiliate"),
    /** The outbound destination — affiliate link or the creator's own store.
     * Optional only for an in-store-only coupon (ADR-0011). */
    affiliateUrl: z.string().url().optional(),
    couponCode: z.string().trim().min(1).max(40).optional(),
    offerEndsAt: z.coerce.date().optional(),
    inStoreNote: z.string().trim().min(1).max(200).optional(),
  })
  .refine(hasAChannel, {
    message: "A product needs a link — or a coupon with an in-store note",
    path: ["affiliateUrl"],
  })
  .refine((input) => input.couponCode || (!input.inStoreNote && !input.offerEndsAt), {
    message: "In-store note and expiry belong to a coupon — add a code",
    path: ["couponCode"],
  });

export type TagProductInput = z.infer<typeof tagProductInput>;

/** Edit or clear a product's coupon ("fix a code"). couponCode: null clears everything. */
export const setProductCouponInput = z
  .object({
    couponCode: z.string().trim().min(1).max(40).nullable(),
    offerEndsAt: z.coerce.date().nullish(),
    inStoreNote: z.string().trim().min(1).max(200).nullish(),
  })
  .refine((input) => input.couponCode !== null || (!input.offerEndsAt && !input.inStoreNote), {
    message: "In-store note and expiry belong to a coupon — add a code",
    path: ["couponCode"],
  });

export type SetProductCouponInput = z.infer<typeof setProductCouponInput>;

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
