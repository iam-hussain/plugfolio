import type {
  CreateCategoryInput,
  CreatePostInput,
  SetPostCategoryInput,
  SetProductCategoryInput,
  SetProfileLinksInput,
  SetProductCouponInput,
  TagProductInput,
  UpdateProductInput,
} from "@plugfolio/core";

/**
 * Client calls for the creator's back room (§5). Contracts are the same
 * Zod-inferred types the API validates, so client and server can't drift.
 */

async function send(path: string, method: string, body?: unknown): Promise<void> {
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
}

export const createProfile = () => send("/api/profiles", "POST");
export const createPost = (input: CreatePostInput) => send("/api/posts", "POST", input);
export const tagProduct = ({ postId, ...body }: TagProductInput) =>
  send(`/api/posts/${postId}/products`, "POST", body);
export const updateProduct = (productId: string, input: UpdateProductInput) =>
  send(`/api/products/${productId}`, "PATCH", input);
export const removeProduct = (productId: string) =>
  send(`/api/products/${productId}`, "DELETE");
export const setProductCoupon = (productId: string, input: SetProductCouponInput) =>
  send(`/api/products/${productId}/coupon`, "PATCH", input);

// Categories (ADR-0010)
export const createCategory = ({ profileId, ...body }: CreateCategoryInput) =>
  send(`/api/profiles/${profileId}/categories`, "POST", body);
export const removeCategory = (categoryId: string) =>
  send(`/api/categories/${categoryId}`, "DELETE");
export const setPostCategory = (postId: string, input: SetPostCategoryInput) =>
  send(`/api/posts/${postId}/category`, "PATCH", input);
export const setProductCategory = (productId: string, input: SetProductCategoryInput) =>
  send(`/api/products/${productId}/category`, "PATCH", input);

// "Your links" (design-out socials row) — replace-all save.
export const saveProfileLinks = (
  profileId: string,
  body: Omit<SetProfileLinksInput, "profileId">,
) => send(`/api/profiles/${profileId}/links`, "PUT", body);
