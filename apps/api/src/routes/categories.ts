import { Hono } from "hono";
import { z } from "zod";
import {
  createCategory,
  createCategoryInput,
  removeCategory,
  setPostCategory,
  setPostCategoryInput,
  setProductCategory,
  setProductCategoryInput,
  updateCategory,
  updateCategoryInput,
} from "@plugfolio/core";
import { requireUserId } from "../auth";
import { creatorContentDeps } from "../container";

/**
 * Per-profile shelves (ADR-0010): Admin + Manager curate categories and assign
 * a post or product to one. Deleting a shelf never deletes content — the rows
 * fall back to "All" (the service enforces this).
 */
export const categoryRoutes = new Hono();

const uuidParam = z.string().uuid();

categoryRoutes.post("/profiles/:profileId/categories", async (c) => {
  const userId = await requireUserId(c);
  const input = createCategoryInput.parse({
    ...(await c.req.json()),
    profileId: c.req.param("profileId"),
  });
  const category = await createCategory(creatorContentDeps, userId, input);
  return c.json({ category }, 201);
});

categoryRoutes.patch("/categories/:categoryId", async (c) => {
  const userId = await requireUserId(c);
  const categoryId = uuidParam.parse(c.req.param("categoryId"));
  const input = updateCategoryInput.parse(await c.req.json());
  await updateCategory(creatorContentDeps, userId, categoryId, input);
  return c.json({ updated: true });
});

categoryRoutes.delete("/categories/:categoryId", async (c) => {
  const userId = await requireUserId(c);
  const categoryId = uuidParam.parse(c.req.param("categoryId"));
  await removeCategory(creatorContentDeps, userId, categoryId);
  return c.json({ removed: true });
});

categoryRoutes.patch("/posts/:postId/category", async (c) => {
  const userId = await requireUserId(c);
  const postId = uuidParam.parse(c.req.param("postId"));
  const input = setPostCategoryInput.parse(await c.req.json());
  await setPostCategory(creatorContentDeps, userId, postId, input);
  return c.json({ updated: true });
});

categoryRoutes.patch("/products/:productId/category", async (c) => {
  const userId = await requireUserId(c);
  const productId = uuidParam.parse(c.req.param("productId"));
  const input = setProductCategoryInput.parse(await c.req.json());
  await setProductCategory(creatorContentDeps, userId, productId, input);
  return c.json({ updated: true });
});
