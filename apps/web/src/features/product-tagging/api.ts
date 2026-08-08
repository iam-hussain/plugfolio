import type {
  UploadKind,
  CreateCategoryInput,
  CreatePostInput,
  CreateProductInput,
  UpdatePostInput,
  SetPostCategoryInput,
  SetPostHiddenInput,
  SetProductCategoryInput,
  SetProfileLinksInput,
  UpdateProfileIdentityInput,
  SetProductCouponInput,
  TagProductInput,
  UpdateProductInput,
  UpdateCategoryInput,
} from "@plugfolio/core";

import { apiDelete, apiPatch, apiPost, apiPut, apiUpload } from "@/lib/api-client";

/**
 * Client calls for the creator's back room (§5). Contracts are the same
 * Zod-inferred types the API validates, so client and server can't drift; the
 * transport (JSON send + error unwrap + multipart upload) is the shared
 * `lib/api-client`.
 */

/**
 * Upload an image (ADR-0023). The API processes it (crop + watermark + WebP →
 * S3) and returns the URL, which the caller saves onto their profile/post/
 * product through the JSON routes.
 */
export const uploadImage = (kind: UploadKind, file: File): Promise<string> =>
  apiUpload(`/api/uploads/${kind}`, file).then((r) => r.url);

export const createProfile = () => apiPost("/api/profiles");
export const createPost = (input: CreatePostInput) =>
  apiPost<{ post: { id: string } }>("/api/posts", input);
export const updatePost = (postId: string, profileId: string, input: UpdatePostInput) =>
  apiPatch(`/api/posts/${postId}`, { ...input, profileId });
/** A product with no post — the library is a real place (§5.21). */
export const createProduct = ({ profileId, ...body }: CreateProductInput) =>
  apiPost<{ product: { id: string } }>(`/api/profiles/${profileId}/products`, body);
/** Connecting copies nothing: one product row, many posts. */
export const connectProduct = (postId: string, productId: string) =>
  apiPost(`/api/posts/${postId}/products/connect`, { productId });
export const disconnectProduct = (postId: string, productId: string) =>
  apiDelete(`/api/posts/${postId}/products/${productId}`);
export const tagProduct = ({ postId, ...body }: TagProductInput) =>
  apiPost(`/api/posts/${postId}/products`, body);
export const updateProduct = (productId: string, input: UpdateProductInput) =>
  apiPatch(`/api/products/${productId}`, input);
export const removeProduct = (productId: string) => apiDelete(`/api/products/${productId}`);
export const setProductCoupon = (productId: string, input: SetProductCouponInput) =>
  apiPatch(`/api/products/${productId}/coupon`, input);

// Categories (ADR-0010)
export const createCategory = ({ profileId, ...body }: CreateCategoryInput) =>
  apiPost(`/api/profiles/${profileId}/categories`, body);
export const updateCategory = (categoryId: string, input: UpdateCategoryInput) =>
  apiPatch(`/api/categories/${categoryId}`, input);
export const removeCategory = (categoryId: string) => apiDelete(`/api/categories/${categoryId}`);
export const setPostCategory = (postId: string, input: SetPostCategoryInput) =>
  apiPatch(`/api/posts/${postId}/category`, input);
export const setPostHidden = (postId: string, input: SetPostHiddenInput) =>
  apiPatch(`/api/posts/${postId}/hidden`, input);
export const setProductCategory = (productId: string, input: SetProductCategoryInput) =>
  apiPatch(`/api/products/${productId}/category`, input);

// "Your links" (design-out socials row) — replace-all save.
export const saveProfileLinks = (
  profileId: string,
  body: Omit<SetProfileLinksInput, "profileId">,
) => apiPut(`/api/profiles/${profileId}/links`, body);

// Public identity + deletion (brief 10).
export const updateProfileIdentity = (
  profileId: string,
  body: Omit<UpdateProfileIdentityInput, "profileId">,
) => apiPatch(`/api/profiles/${profileId}`, body);
export const deleteProfile = (profileId: string) => apiDelete(`/api/profiles/${profileId}`);
