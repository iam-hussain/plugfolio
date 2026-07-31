import { z } from "zod";

/**
 * Boundary schemas (§6.4) for the creator's back room. The actor is always
 * the verified session user; profile ownership is checked in the service.
 */

/**
 * What a post IS (ADR-0019). `still` is the default and the only kind with no
 * embed — the other three are videos that load as a facade.
 */
export const postMediaKind = z.enum(["still", "youtube", "instagram", "tiktok"]);

export type PostMediaKind = z.infer<typeof postMediaKind>;

/**
 * The post's media. Two fields, not one select: a photo is not a fourth kind
 * of social video — it's an image you own, and it can sit *alongside* a video
 * rather than instead of it. The still is what a visitor sees before pressing
 * play, and what a link unfurls to when it's shared, so a video post needs one
 * too.
 */
const postMedia = {
  /** The still. Always present — the facade has to show something (ADR-0019). */
  mediaUrl: z.string().url(),
  mediaKind: postMediaKind.default("still"),
  /** The provider's embed URL. Only meaningful on a video post. */
  embedUrl: z.string().url().nullish(),
  /** Where the video lives publicly ("Watch on YouTube instead"). */
  sourceUrl: z.string().url().nullish(),
  caption: z.string().trim().max(500).nullish(),
  /** A shelf is never required before a post goes live (ADR-0010). */
  categoryId: z.string().uuid().nullish(),
};

/** A video kind without a link is a play button that opens nothing. */
const videoNeedsALink = (input: {
  mediaKind?: PostMediaKind;
  embedUrl?: string | null;
  sourceUrl?: string | null;
}) =>
  input.mediaKind === undefined ||
  input.mediaKind === "still" ||
  Boolean(input.embedUrl ?? input.sourceUrl);

export const createPostInput = z
  .object({ profileId: z.string().uuid(), ...postMedia })
  .refine(videoNeedsALink, {
    message: "A video post needs the video's link",
    path: ["embedUrl"],
  });

export type CreatePostInput = z.infer<typeof createPostInput>;

/** Editing a post: the same fields, minus the profile it can never move to. */
export const updatePostInput = z
  .object(postMedia)
  .partial({ mediaKind: true })
  .refine(videoNeedsALink, {
    message: "A video post needs the video's link",
    path: ["embedUrl"],
  });

export type UpdatePostInput = z.infer<typeof updatePostInput>;

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

/**
 * A product on its own, with no post to hang it on. The library is a real
 * place: a product can be made here and connected to a post later, or to none
 * at all (an in-store code has nowhere to be tagged).
 */
export const createProductInput = z
  .object({
    profileId: z.string().uuid(),
    /** The product page to read the title, image and price from. */
    url: z.string().url(),
    kind: productKind.default("affiliate"),
    affiliateUrl: z.string().url().optional(),
    categoryId: z.string().uuid().nullish(),
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

export type CreateProductInput = z.infer<typeof createProductInput>;

/**
 * Editing the product itself — where it came from, whose it is, where it goes.
 * The coupon has its own route (`setProductCouponInput`) because clearing it is
 * a different shape from changing a link.
 *
 * `affiliateUrl: null` is how a product becomes in-store-only; the service
 * refuses it when there's no in-store note to fall back on, so a product can
 * never end up with no way to act on it at all.
 */
export const updateProductInput = z.object({
  sourceUrl: z.string().url().optional(),
  kind: productKind.optional(),
  affiliateUrl: z.string().url().nullish(),
  /** Re-read the page when the source URL changed — off by default. */
  refreshMetadata: z.boolean().optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductInput>;

/** Connecting an existing product to a post. Copies nothing — it's one row. */
export const connectProductInput = z.object({
  productId: z.string().uuid(),
});

export type ConnectProductInput = z.infer<typeof connectProductInput>;

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

export const setPostHiddenInput = z.object({
  profileId: z.string().uuid(),
  hidden: z.boolean(),
});

export type SetPostHiddenInput = z.infer<typeof setPostHiddenInput>;

export const setProductCategoryInput = z.object({
  categoryId: z.string().uuid().nullable(),
});

export type SetProductCategoryInput = z.infer<typeof setProductCategoryInput>;
