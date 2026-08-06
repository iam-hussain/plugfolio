import { Hono } from "hono";
import { z } from "zod";
import {
  AppError,
  MAX_UPLOAD_BYTES,
  connectProductInput,
  connectProductToPost,
  createPost,
  createPostInput,
  createProduct,
  createProductInput,
  createProfile,
  disconnectProductFromPost,
  removeProduct,
  setPostHidden,
  setPostHiddenInput,
  setProductCoupon,
  setProductCouponInput,
  tagProductInput,
  tagProductToPost,
  updatePost,
  updatePostInput,
  updateProduct,
  updateProductInput,
  uploadImage,
  uploadKind,
} from "@plugfolio/core";
import { requireUserId } from "../auth";
import { creatorContentDeps, imageUploadDeps } from "../container";

/**
 * The creator's back room (lean journey: Posts + Products tabs). Create a
 * profile, post content, tag products to posts, keep a library of products with
 * no post, upload imagery. Business rules (the channel rule, the 5-profile cap)
 * live in the service — these are thin controllers (§6.3).
 */
export const creatorContentRoutes = new Hono();

const uuidParam = z.string().uuid();

creatorContentRoutes.post("/profiles", async (c) => {
  const userId = await requireUserId(c);
  const profile = await createProfile(creatorContentDeps, userId);
  return c.json({ profile }, 201);
});

creatorContentRoutes.post("/posts", async (c) => {
  const userId = await requireUserId(c);
  const input = createPostInput.parse(await c.req.json());
  const post = await createPost(creatorContentDeps, userId, input);
  return c.json({ post }, 201);
});

// The core tool: paste a product URL + affiliate link, tag it to the post.
creatorContentRoutes.post("/posts/:postId/products", async (c) => {
  const userId = await requireUserId(c);
  const input = tagProductInput.parse({
    ...(await c.req.json()),
    postId: c.req.param("postId"),
  });
  const product = await tagProductToPost(creatorContentDeps, userId, input);
  return c.json({ product }, 201);
});

// The product itself (DESIGN product-edit.html). Clearing the link is only
// legal in light of the coupon the product already has — the service decides.
creatorContentRoutes.patch("/products/:productId", async (c) => {
  const userId = await requireUserId(c);
  const productId = uuidParam.parse(c.req.param("productId"));
  const input = updateProductInput.parse(await c.req.json());
  await updateProduct(creatorContentDeps, userId, productId, input);
  return c.json({ updated: true });
});

// A product with no post — the library is a real place, and an in-store code
// has nowhere to be tagged (§5.21).
creatorContentRoutes.post("/profiles/:profileId/products", async (c) => {
  const userId = await requireUserId(c);
  const input = createProductInput.parse({
    ...(await c.req.json()),
    profileId: c.req.param("profileId"),
  });
  const product = await createProduct(creatorContentDeps, userId, input);
  return c.json({ product }, 201);
});

// Upload an image (ADR-0023): process → S3 → return the URL the caller then
// saves onto their own profile/post/product via the existing edit routes.
creatorContentRoutes.post("/uploads/:kind", async (c) => {
  await requireUserId(c);
  if (!imageUploadDeps) throw new AppError("INTERNAL", "Image uploads are not configured");
  const kind = uploadKind.parse(c.req.param("kind"));
  const file = (await c.req.parseBody()).file;
  if (!(file instanceof File))
    throw new AppError("VALIDATION", "Expected a file field named 'file'");
  if (file.size > MAX_UPLOAD_BYTES) throw new AppError("VALIDATION", "Image too large");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const uploaded = await uploadImage(imageUploadDeps, kind, { bytes });
  return c.json(uploaded, 201);
});

// Connect an existing product to a post. Copies nothing — one row, many posts.
creatorContentRoutes.post("/posts/:postId/products/connect", async (c) => {
  const userId = await requireUserId(c);
  const postId = uuidParam.parse(c.req.param("postId"));
  const input = connectProductInput.parse(await c.req.json());
  await connectProductToPost(creatorContentDeps, userId, postId, input.productId);
  return c.json({ connected: true }, 201);
});

// Take it off this post. Deliberately not a delete — the product is still
// yours and may sit on others.
creatorContentRoutes.delete("/posts/:postId/products/:productId", async (c) => {
  const userId = await requireUserId(c);
  const postId = uuidParam.parse(c.req.param("postId"));
  const productId = uuidParam.parse(c.req.param("productId"));
  await disconnectProductFromPost(creatorContentDeps, userId, postId, productId);
  return c.json({ connected: false });
});

creatorContentRoutes.delete("/products/:productId", async (c) => {
  const userId = await requireUserId(c);
  const productId = uuidParam.parse(c.req.param("productId"));
  await removeProduct(creatorContentDeps, userId, productId);
  return c.json({ removed: true });
});

// Edit or clear a product's coupon (ADR-0011: "fix a code").
creatorContentRoutes.patch("/products/:productId/coupon", async (c) => {
  const userId = await requireUserId(c);
  const productId = uuidParam.parse(c.req.param("productId"));
  const input = setProductCouponInput.parse(await c.req.json());
  await setProductCoupon(creatorContentDeps, userId, productId, input);
  return c.json({ updated: true });
});

// Edit the post itself (DESIGN post-edit.html): its still, its video, its
// words, its shelf.
creatorContentRoutes.patch("/posts/:postId", async (c) => {
  const userId = await requireUserId(c);
  const postId = uuidParam.parse(c.req.param("postId"));
  const body = (await c.req.json()) as { profileId?: unknown };
  const profileId = uuidParam.parse(body.profileId);
  const input = updatePostInput.parse(body);
  await updatePost(creatorContentDeps, userId, postId, profileId, input);
  return c.json({ updated: true });
});

// Hide a post from the public page, or bring it back (brief 07).
creatorContentRoutes.patch("/posts/:postId/hidden", async (c) => {
  const userId = await requireUserId(c);
  const postId = uuidParam.parse(c.req.param("postId"));
  const input = setPostHiddenInput.parse(await c.req.json());
  await setPostHidden(creatorContentDeps, userId, postId, input);
  return c.json({ updated: true });
});
