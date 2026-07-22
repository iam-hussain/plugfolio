import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { z } from "zod";
import {
  DEVICE_COOKIE,
  addComment,
  addCommentInput,
  agreeCollab,
  approachRequirement,
  approachRequirementInput,
  collabMessageInput,
  createBusiness,
  createBusinessInput,
  createCategory,
  emailOnlyInput,
  registerAccount,
  registerInput,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  resetPasswordInput,
  verifyEmail,
  verifyEmailInput,
  createCategoryInput,
  createPost,
  createPostInput,
  createProfile,
  inviteManager,
  inviteManagerInput,
  followProfile,
  followProfileInput,
  postRequirement,
  postRequirementInput,
  recordCodeCopy,
  recordCodeCopyInput,
  recordOutboundTap,
  recordOutboundTapInput,
  removeCategory,
  removeManager,
  removeProduct,
  requestCollab,
  requestCollabInput,
  sendCollabMessage,
  setPostCategory,
  setPostCategoryInput,
  setProductCategory,
  setProductCategoryInput,
  setProductCoupon,
  setProductCouponInput,
  tagProductToPost,
  tagProductInput,
  unfollowProfile,
  updateCategory,
  updateCategoryInput,
  updateMemberHandle,
  updateMemberHandleInput,
  updateProductAffiliateUrl,
  updateProductInput,
} from "@plugfolio/core";
import { deviceIdentity, requireUserId } from "./auth";
import {
  accountAuthDeps,
  businessCollabDeps,
  clock,
  creatorContentDeps,
  profileManagerDeps,
  repositories,
  shopperSocialDeps,
} from "./container";
import { toErrorShape } from "./http/error-response";

/**
 * The standalone REST API (ADR-0008, ADR-0006): thin controllers only —
 * verify identity → validate with Zod → call one service → shape response
 * (§6.3). Served under /api so the web app's same-origin proxy and future
 * mobile clients hit identical paths. Business logic lives in @plugfolio/core.
 */
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const uuidParam = z.string().uuid();

export const app = new Hono().basePath("/api");

app.onError((error, c) => {
  const { status, body } = toErrorShape(error);
  return c.json(body, status);
});

app.get("/health", (c) => c.json({ status: "ok" }));

// --- Password auth (ADR-0012). NOT under /api/auth — that path belongs to
// Auth.js in apps/web; login itself goes through the Credentials provider.

app.post("/account", async (c) => {
  const input = registerInput.parse(await c.req.json());
  await registerAccount(accountAuthDeps, input);
  return c.json({ registered: true }, 201);
});

app.post("/account/verify", async (c) => {
  const input = verifyEmailInput.parse(await c.req.json());
  await verifyEmail(accountAuthDeps, input);
  return c.json({ verified: true });
});

app.post("/account/resend-verification", async (c) => {
  const input = emailOnlyInput.parse(await c.req.json());
  await resendVerification(accountAuthDeps, input);
  return c.json({ sent: true });
});

app.post("/account/reset-request", async (c) => {
  const input = emailOnlyInput.parse(await c.req.json());
  await requestPasswordReset(accountAuthDeps, input);
  // Always ok — never an existence oracle.
  return c.json({ sent: true });
});

app.post("/account/reset", async (c) => {
  const input = resetPasswordInput.parse(await c.req.json());
  await resetPassword(accountAuthDeps, input);
  return c.json({ reset: true });
});

// The no-login shopper write (ADR-0002): anonymous device identity, never a session.
app.post("/taps", async (c) => {
  const input = recordOutboundTapInput.parse(await c.req.json());
  const { deviceId, issued } = deviceIdentity(c);

  const tap = await recordOutboundTap(
    { taps: repositories.taps, products: repositories.products, now: clock.now },
    { ...input, deviceId },
  );

  if (issued) {
    setCookie(c, DEVICE_COOKIE, issued.token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
    });
  }
  return c.json({ tap }, 201);
});

// The coupon-code copy — the second anonymous attribution event (ADR-0011),
// same device-identity + idempotency rules as taps.
app.post("/code-copies", async (c) => {
  const input = recordCodeCopyInput.parse(await c.req.json());
  const { deviceId, issued } = deviceIdentity(c);

  const copy = await recordCodeCopy(
    { codeCopies: repositories.codeCopies, products: repositories.products, now: clock.now },
    { ...input, deviceId },
  );

  if (issued) {
    setCookie(c, DEVICE_COOKIE, issued.token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
    });
  }
  return c.json({ copy }, 201);
});

app.post("/follows", async (c) => {
  const userId = await requireUserId(c);
  const input = followProfileInput.parse(await c.req.json());
  await followProfile(shopperSocialDeps, userId, input.profileId);
  return c.json({ following: true }, 201);
});

app.delete("/follows/:profileId", async (c) => {
  const userId = await requireUserId(c);
  const profileId = uuidParam.parse(c.req.param("profileId"));
  await unfollowProfile(shopperSocialDeps, userId, profileId);
  return c.json({ following: false });
});

app.post("/comments", async (c) => {
  const userId = await requireUserId(c);
  const input = addCommentInput.parse(await c.req.json());
  const comment = await addComment(shopperSocialDeps, userId, input);
  return c.json({ comment }, 201);
});

// The member handle (ADR-0009): public identity, never a login.
app.patch("/me/handle", async (c) => {
  const userId = await requireUserId(c);
  const input = updateMemberHandleInput.parse(await c.req.json());
  await updateMemberHandle({ users: repositories.users }, userId, input);
  return c.json({ updated: true });
});

app.post("/businesses", async (c) => {
  const userId = await requireUserId(c);
  const input = createBusinessInput.parse(await c.req.json());
  const business = await createBusiness(businessCollabDeps, userId, input);
  return c.json({ business }, 201);
});

app.post("/requirements", async (c) => {
  const userId = await requireUserId(c);
  const input = postRequirementInput.parse(await c.req.json());
  const requirement = await postRequirement(businessCollabDeps, userId, input);
  return c.json({ requirement }, 201);
});

app.post("/collabs/approach", async (c) => {
  const userId = await requireUserId(c);
  const input = approachRequirementInput.parse(await c.req.json());
  const collabId = await approachRequirement(businessCollabDeps, userId, input);
  return c.json({ collabId }, 201);
});

app.post("/collabs/request", async (c) => {
  const userId = await requireUserId(c);
  const input = requestCollabInput.parse(await c.req.json());
  const collabId = await requestCollab(businessCollabDeps, userId, input);
  return c.json({ collabId }, 201);
});

app.post("/collabs/:collabId/messages", async (c) => {
  const userId = await requireUserId(c);
  const collabId = uuidParam.parse(c.req.param("collabId"));
  const input = collabMessageInput.parse(await c.req.json());
  await sendCollabMessage(businessCollabDeps, userId, collabId, input);
  return c.json({ sent: true }, 201);
});

app.post("/collabs/:collabId/agree", async (c) => {
  const userId = await requireUserId(c);
  const collabId = uuidParam.parse(c.req.param("collabId"));
  await agreeCollab(businessCollabDeps, userId, collabId);
  return c.json({ agreed: true });
});

// --- The creator's back room (lean journey: Posts + Products tabs) ---

app.post("/profiles", async (c) => {
  const userId = await requireUserId(c);
  const profile = await createProfile(creatorContentDeps, userId);
  return c.json({ profile }, 201);
});

app.post("/posts", async (c) => {
  const userId = await requireUserId(c);
  const input = createPostInput.parse(await c.req.json());
  const post = await createPost(creatorContentDeps, userId, input);
  return c.json({ post }, 201);
});

// The core tool: paste a product URL + affiliate link, tag it to the post.
app.post("/posts/:postId/products", async (c) => {
  const userId = await requireUserId(c);
  const input = tagProductInput.parse({
    ...(await c.req.json()),
    postId: c.req.param("postId"),
  });
  const product = await tagProductToPost(creatorContentDeps, userId, input);
  return c.json({ product }, 201);
});

app.patch("/products/:productId", async (c) => {
  const userId = await requireUserId(c);
  const productId = uuidParam.parse(c.req.param("productId"));
  const input = updateProductInput.parse(await c.req.json());
  await updateProductAffiliateUrl(creatorContentDeps, userId, productId, input.affiliateUrl);
  return c.json({ updated: true });
});

app.delete("/products/:productId", async (c) => {
  const userId = await requireUserId(c);
  const productId = uuidParam.parse(c.req.param("productId"));
  await removeProduct(creatorContentDeps, userId, productId);
  return c.json({ removed: true });
});

// Edit or clear a product's coupon (ADR-0011: "fix a code").
app.patch("/products/:productId/coupon", async (c) => {
  const userId = await requireUserId(c);
  const productId = uuidParam.parse(c.req.param("productId"));
  const input = setProductCouponInput.parse(await c.req.json());
  await setProductCoupon(creatorContentDeps, userId, productId, input);
  return c.json({ updated: true });
});

// --- Categories (ADR-0010: per-profile shelves; Admin + Manager curate) ---

app.post("/profiles/:profileId/categories", async (c) => {
  const userId = await requireUserId(c);
  const input = createCategoryInput.parse({
    ...(await c.req.json()),
    profileId: c.req.param("profileId"),
  });
  const category = await createCategory(creatorContentDeps, userId, input);
  return c.json({ category }, 201);
});

app.patch("/categories/:categoryId", async (c) => {
  const userId = await requireUserId(c);
  const categoryId = uuidParam.parse(c.req.param("categoryId"));
  const input = updateCategoryInput.parse(await c.req.json());
  await updateCategory(creatorContentDeps, userId, categoryId, input);
  return c.json({ updated: true });
});

app.delete("/categories/:categoryId", async (c) => {
  const userId = await requireUserId(c);
  const categoryId = uuidParam.parse(c.req.param("categoryId"));
  await removeCategory(creatorContentDeps, userId, categoryId);
  return c.json({ removed: true });
});

app.patch("/posts/:postId/category", async (c) => {
  const userId = await requireUserId(c);
  const postId = uuidParam.parse(c.req.param("postId"));
  const input = setPostCategoryInput.parse(await c.req.json());
  await setPostCategory(creatorContentDeps, userId, postId, input);
  return c.json({ updated: true });
});

app.patch("/products/:productId/category", async (c) => {
  const userId = await requireUserId(c);
  const productId = uuidParam.parse(c.req.param("productId"));
  const input = setProductCategoryInput.parse(await c.req.json());
  await setProductCategory(creatorContentDeps, userId, productId, input);
  return c.json({ updated: true });
});

// --- Managers (ADR-0004: Admin-only settings surface) ---

app.post("/profiles/:profileId/managers", async (c) => {
  const userId = await requireUserId(c);
  const input = inviteManagerInput.parse({
    ...(await c.req.json()),
    profileId: c.req.param("profileId"),
  });
  await inviteManager(profileManagerDeps, userId, input);
  return c.json({ invited: true }, 201);
});

app.delete("/profiles/:profileId/managers/:managerUserId", async (c) => {
  const userId = await requireUserId(c);
  const profileId = uuidParam.parse(c.req.param("profileId"));
  const managerUserId = uuidParam.parse(c.req.param("managerUserId"));
  await removeManager(profileManagerDeps, userId, profileId, managerUserId);
  return c.json({ removed: true });
});
