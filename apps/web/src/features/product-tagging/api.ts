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

/**
 * Client calls for the creator's back room (§5). Contracts are the same
 * Zod-inferred types the API validates, so client and server can't drift.
 */

async function send<T = void>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(problem?.error?.message ?? "Request failed");
  }
  return (await response.json().catch(() => undefined)) as T;
}

/**
 * Upload an image (ADR-0023) — multipart, so it can't use `send` (JSON). The
 * API processes it (crop + watermark + WebP → S3) and returns the URL, which
 * the caller saves onto their profile/post/product through the JSON routes.
 */
export async function uploadImage(kind: UploadKind, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`/api/uploads/${kind}`, {
    method: "POST",
    body: form,
    credentials: "same-origin",
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(problem?.error?.message ?? "Upload failed");
  }
  return ((await response.json()) as { url: string }).url;
}

export const createProfile = () => send("/api/profiles", "POST");
export const createPost = (input: CreatePostInput) =>
  send<{ post: { id: string } }>("/api/posts", "POST", input);
export const updatePost = (postId: string, profileId: string, input: UpdatePostInput) =>
  send(`/api/posts/${postId}`, "PATCH", { ...input, profileId });
/** A product with no post — the library is a real place (§5.21). */
export const createProduct = ({ profileId, ...body }: CreateProductInput) =>
  send<{ product: { id: string } }>(`/api/profiles/${profileId}/products`, "POST", body);
/** Connecting copies nothing: one product row, many posts. */
export const connectProduct = (postId: string, productId: string) =>
  send(`/api/posts/${postId}/products/connect`, "POST", { productId });
export const disconnectProduct = (postId: string, productId: string) =>
  send(`/api/posts/${postId}/products/${productId}`, "DELETE");
export const tagProduct = ({ postId, ...body }: TagProductInput) =>
  send(`/api/posts/${postId}/products`, "POST", body);
export const updateProduct = (productId: string, input: UpdateProductInput) =>
  send(`/api/products/${productId}`, "PATCH", input);
export const removeProduct = (productId: string) => send(`/api/products/${productId}`, "DELETE");
export const setProductCoupon = (productId: string, input: SetProductCouponInput) =>
  send(`/api/products/${productId}/coupon`, "PATCH", input);

// Categories (ADR-0010)
export const createCategory = ({ profileId, ...body }: CreateCategoryInput) =>
  send(`/api/profiles/${profileId}/categories`, "POST", body);
export const updateCategory = (categoryId: string, input: UpdateCategoryInput) =>
  send(`/api/categories/${categoryId}`, "PATCH", input);
export const removeCategory = (categoryId: string) =>
  send(`/api/categories/${categoryId}`, "DELETE");
export const setPostCategory = (postId: string, input: SetPostCategoryInput) =>
  send(`/api/posts/${postId}/category`, "PATCH", input);
export const setPostHidden = (postId: string, input: SetPostHiddenInput) =>
  send(`/api/posts/${postId}/hidden`, "PATCH", input);
export const setProductCategory = (productId: string, input: SetProductCategoryInput) =>
  send(`/api/products/${productId}/category`, "PATCH", input);

// "Your links" (design-out socials row) — replace-all save.
export const saveProfileLinks = (
  profileId: string,
  body: Omit<SetProfileLinksInput, "profileId">,
) => send(`/api/profiles/${profileId}/links`, "PUT", body);

// Public identity + deletion (brief 10).
export const updateProfileIdentity = (
  profileId: string,
  body: Omit<UpdateProfileIdentityInput, "profileId">,
) => send(`/api/profiles/${profileId}`, "PATCH", body);
export const deleteProfile = (profileId: string) => send(`/api/profiles/${profileId}`, "DELETE");
