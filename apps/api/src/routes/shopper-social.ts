import { Hono } from "hono";
import { z } from "zod";
import {
  ForbiddenError,
  addComment,
  addCommentInput,
  followProfile,
  followProfileInput,
  isFeatureEnabled,
  reactToComment,
  reactToCommentInput,
  unfollowProfile,
  unwatchTarget,
  updateMemberHandle,
  updateMemberHandleInput,
  updateMemberImage,
  updateMemberImageInput,
  watchKind,
  watchTarget,
  watchTargetInput,
} from "@plugfolio/core";
import { requireUserId } from "../auth";
import { repositories, shopperSocialDeps, watchlistDeps } from "../container";

/**
 * The account-gated shopper actions (ADR-0002 §2.2: an account, never a wall on
 * buying): follow, save to the watchlist, comment + react, and the member's own
 * public identity (handle/picture, ADR-0009). Reading any of these never needs
 * an account; doing them does.
 */
export const shopperSocialRoutes = new Hono();

const uuidParam = z.string().uuid();

shopperSocialRoutes.post("/follows", async (c) => {
  const userId = await requireUserId(c);
  const input = followProfileInput.parse(await c.req.json());
  await followProfile(shopperSocialDeps, userId, input.profileId);
  return c.json({ following: true }, 201);
});

shopperSocialRoutes.delete("/follows/:profileId", async (c) => {
  const userId = await requireUserId(c);
  const profileId = uuidParam.parse(c.req.param("profileId"));
  await unfollowProfile(shopperSocialDeps, userId, profileId);
  return c.json({ following: false });
});

// The watchlist (shopper-account.md): save a post or a product for later. Same
// door as follow — an account, never a wall on buying (§2.2).
shopperSocialRoutes.post("/watchlist", async (c) => {
  const userId = await requireUserId(c);
  const input = watchTargetInput.parse(await c.req.json());
  await watchTarget(watchlistDeps, userId, input);
  return c.json({ watched: true }, 201);
});

shopperSocialRoutes.delete("/watchlist/:kind/:targetId", async (c) => {
  const userId = await requireUserId(c);
  const input = watchTargetInput.parse({
    kind: watchKind.parse(c.req.param("kind")),
    targetId: uuidParam.parse(c.req.param("targetId")),
  });
  await unwatchTarget(watchlistDeps, userId, input);
  return c.json({ watched: false });
});

shopperSocialRoutes.post("/comments", async (c) => {
  const userId = await requireUserId(c);
  // Kill switch (admin Settings): flags default ON; off = read-only comments.
  if (!(await isFeatureEnabled({ settings: repositories.settings }, "comments", true))) {
    throw new ForbiddenError("Comments are switched off right now");
  }
  const input = addCommentInput.parse(await c.req.json());
  const comment = await addComment(shopperSocialDeps, userId, input);
  return c.json({ comment }, 201);
});

// Helpful / not helpful on a comment. Needs an account like follow and comment
// do — reading the counts never does. Same kill switch.
shopperSocialRoutes.post("/comments/:commentId/reaction", async (c) => {
  const userId = await requireUserId(c);
  if (!(await isFeatureEnabled({ settings: repositories.settings }, "comments", true))) {
    throw new ForbiddenError("Comments are switched off right now");
  }
  const input = reactToCommentInput.parse({
    commentId: c.req.param("commentId"),
    ...((await c.req.json()) as object),
  });
  await reactToComment(shopperSocialDeps, userId, input);
  return c.json({ ok: true });
});

// The member handle + picture (ADR-0009): public identity, never a login.
shopperSocialRoutes.patch("/me/image", async (c) => {
  const userId = await requireUserId(c);
  const input = updateMemberImageInput.parse(await c.req.json());
  await updateMemberImage({ users: repositories.users }, userId, input);
  return c.json({ updated: true });
});

shopperSocialRoutes.patch("/me/handle", async (c) => {
  const userId = await requireUserId(c);
  const input = updateMemberHandleInput.parse(await c.req.json());
  await updateMemberHandle(
    { users: repositories.users, settings: repositories.settings },
    userId,
    input,
  );
  return c.json({ updated: true });
});
