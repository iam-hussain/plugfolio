import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { z } from "zod";
import {
  AppError,
  DEVICE_COOKIE,
  MAX_UPLOAD_BYTES,
  uploadImage,
  uploadKind,
  addComment,
  addCommentInput,
  reactToComment,
  reactToCommentInput,
  agreeCollab,
  approachRequirement,
  approachRequirementInput,
  collabMessageInput,
  createBusiness,
  createBusinessInput,
  connectProductInput,
  connectProductToPost,
  createCategory,
  emailOnlyInput,
  identifierInput,
  registerAccount,
  registerInput,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  resetPasswordInput,
  verifyEmail,
  verifyEmailInput,
  createCategoryInput,
  createProduct,
  createProductInput,
  disconnectProductFromPost,
  createPost,
  createPostInput,
  createProfile,
  inviteManager,
  inviteManagerInput,
  followProfile,
  followProfileInput,
  postRequirement,
  postRequirementInput,
  closeRequirement,
  proposeCollabTerms,
  proposeTermsInput,
  setProfileLinks,
  setProfileLinksInput,
  updateProfileIdentity,
  updateProfileIdentityInput,
  deleteProfile,
  recordCodeCopy,
  recordCodeCopyInput,
  recordOutboundTap,
  recordOutboundTapInput,
  recordView,
  recordViewInput,
  removeCategory,
  removeManager,
  removeProduct,
  requestCollab,
  requestCollabInput,
  sendCollabMessage,
  setPostCategory,
  setPostCategoryInput,
  setPostHidden,
  setPostHiddenInput,
  setProductCategory,
  setProductCategoryInput,
  setProductCoupon,
  setProductCouponInput,
  tagProductToPost,
  tagProductInput,
  unfollowProfile,
  updateCategory,
  updateCategoryInput,
  updatePost,
  updatePostInput,
  updateProduct,
  updateMemberHandle,
  updateMemberHandleInput,
  createReport,
  createReportInput,
  createSupportTicket,
  createSupportTicketInput,
  isFeatureEnabled,
  ForbiddenError,
  updateProductInput,
} from "@plugfolio/core";
import { deviceIdentity, requireUserId, sessionUserId } from "./auth";
import {
  accountAuthDeps,
  businessCollabDeps,
  clock,
  creatorContentDeps,
  imageUploadDeps,
  profileIdentityDeps,
  profileLinkDeps,
  profileManagerDeps,
  repositories,
  shopperSocialDeps,
  verifyEmailDeps,
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
  await verifyEmail(verifyEmailDeps, input);
  return c.json({ verified: true });
});

app.post("/account/resend-verification", async (c) => {
  // Email or username — the sign-in screen may only know what was typed there.
  const input = identifierInput.parse(await c.req.json());
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

// The third anonymous attribution event: a shoppable surface opening. Same
// device-identity + idempotency rules as taps — it is the denominator they are
// read against, so it has to be counted the same way.
app.post("/views", async (c) => {
  const input = recordViewInput.parse(await c.req.json());
  const { deviceId, issued } = deviceIdentity(c);

  const view = await recordView(
    { views: repositories.views, viewTargets: repositories.viewTargets, now: clock.now },
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
  return c.json({ view }, 201);
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
  // Kill switch (admin Settings): flags default ON; off = read-only comments.
  if (!(await isFeatureEnabled({ settings: repositories.settings }, "comments", true))) {
    throw new ForbiddenError("Comments are switched off right now");
  }
  const input = addCommentInput.parse(await c.req.json());
  const comment = await addComment(shopperSocialDeps, userId, input);
  return c.json({ comment }, 201);
});

// Helpful / not helpful on a comment. Needs an account like follow and comment
// do — reading the counts never does. Same kill switch: with comments off, the
// thread is read-only, and that includes agreeing with one.
app.post("/comments/:commentId/reaction", async (c) => {
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

// Reporting (admin queue inflow): account-free like shopping — the signed
// device cookie is identity enough; a signed-in member reports as @handle.
app.post("/reports", async (c) => {
  if (!(await isFeatureEnabled({ settings: repositories.settings }, "reports", true))) {
    throw new ForbiddenError("Reporting is switched off right now");
  }
  const input = createReportInput.parse(await c.req.json());
  const userId = await sessionUserId(c);
  const handle = userId ? await repositories.users.getHandle(userId) : null;
  await createReport({ reports: repositories.reportWrites }, input, { handle });
  const { issued } = deviceIdentity(c);
  if (issued) {
    setCookie(c, DEVICE_COOKIE, issued.token, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: ONE_YEAR_SECONDS,
      path: "/",
    });
  }
  return c.json({ reported: true }, 201);
});

// Support inflow (docs/implementation/support.md): account-free on purpose —
// the top category is "I lost access to my email", which means no sign-in.
// A session only enriches the ticket with the member's @handle.
app.post("/support", async (c) => {
  if (!(await isFeatureEnabled({ settings: repositories.settings }, "support", true))) {
    throw new ForbiddenError("Support requests are switched off right now");
  }
  const input = createSupportTicketInput.parse(await c.req.json());
  const userId = await sessionUserId(c);
  const handle = userId ? await repositories.users.getHandle(userId) : null;
  await createSupportTicket({ support: repositories.supportWrites }, input, { handle });
  return c.json({ received: true }, 201);
});

// The member handle (ADR-0009): public identity, never a login.
app.patch("/me/handle", async (c) => {
  const userId = await requireUserId(c);
  const input = updateMemberHandleInput.parse(await c.req.json());
  await updateMemberHandle(
    { users: repositories.users, settings: repositories.settings },
    userId,
    input,
  );
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

// Propose terms (brief 12): either side; resets both agreements.
app.post("/collabs/:collabId/terms", async (c) => {
  const userId = await requireUserId(c);
  const collabId = uuidParam.parse(c.req.param("collabId"));
  const input = proposeTermsInput.parse(await c.req.json());
  await proposeCollabTerms(businessCollabDeps, userId, collabId, input);
  return c.json({ proposed: true });
});

// Close a requirement (brief 11): off the board; threads persist.
app.post("/requirements/:requirementId/close", async (c) => {
  const userId = await requireUserId(c);
  const requirementId = uuidParam.parse(c.req.param("requirementId"));
  await closeRequirement(businessCollabDeps, userId, requirementId);
  return c.json({ closed: true });
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

// The product itself (DESIGN product-edit.html): where it came from, whose it
// is, where it goes. The channel rule lives in the service — clearing the link
// is only legal in light of the coupon the product already has.
app.patch("/products/:productId", async (c) => {
  const userId = await requireUserId(c);
  const productId = uuidParam.parse(c.req.param("productId"));
  const input = updateProductInput.parse(await c.req.json());
  await updateProduct(creatorContentDeps, userId, productId, input);
  return c.json({ updated: true });
});

// A product with no post — the library is a real place, and an in-store code
// has nowhere to be tagged (§5.21).
app.post("/profiles/:profileId/products", async (c) => {
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
app.post("/uploads/:kind", async (c) => {
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
app.post("/posts/:postId/products/connect", async (c) => {
  const userId = await requireUserId(c);
  const postId = uuidParam.parse(c.req.param("postId"));
  const input = connectProductInput.parse(await c.req.json());
  await connectProductToPost(creatorContentDeps, userId, postId, input.productId);
  return c.json({ connected: true }, 201);
});

// Take it off this post. Deliberately not a delete — the product is still
// yours and may sit on others.
app.delete("/posts/:postId/products/:productId", async (c) => {
  const userId = await requireUserId(c);
  const postId = uuidParam.parse(c.req.param("postId"));
  const productId = uuidParam.parse(c.req.param("productId"));
  await disconnectProductFromPost(creatorContentDeps, userId, postId, productId);
  return c.json({ connected: false });
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

// Hide a post from the public page, or bring it back (brief 07).
// Edit the post itself (DESIGN post-edit.html): its still, its video, its
// words, its shelf.
app.patch("/posts/:postId", async (c) => {
  const userId = await requireUserId(c);
  const postId = uuidParam.parse(c.req.param("postId"));
  const body = (await c.req.json()) as { profileId?: unknown };
  const profileId = uuidParam.parse(body.profileId);
  const input = updatePostInput.parse(body);
  await updatePost(creatorContentDeps, userId, postId, profileId, input);
  return c.json({ updated: true });
});

app.patch("/posts/:postId/hidden", async (c) => {
  const userId = await requireUserId(c);
  const postId = uuidParam.parse(c.req.param("postId"));
  const input = setPostHiddenInput.parse(await c.req.json());
  await setPostHidden(creatorContentDeps, userId, postId, input);
  return c.json({ updated: true });
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
  await inviteManager({ ...profileManagerDeps, auth: accountAuthDeps }, userId, input);
  return c.json({ invited: true }, 201);
});

app.delete("/profiles/:profileId/managers/:managerUserId", async (c) => {
  const userId = await requireUserId(c);
  const profileId = uuidParam.parse(c.req.param("profileId"));
  const managerUserId = uuidParam.parse(c.req.param("managerUserId"));
  await removeManager(profileManagerDeps, userId, profileId, managerUserId);
  return c.json({ removed: true });
});

// Public identity (brief 10): Admin edits everything; a Manager only the picture.
app.patch("/profiles/:profileId", async (c) => {
  const userId = await requireUserId(c);
  const input = updateProfileIdentityInput.parse({
    ...(await c.req.json()),
    profileId: c.req.param("profileId"),
  });
  await updateProfileIdentity(profileIdentityDeps, userId, input);
  return c.json({ updated: true });
});

// Destructive, Admin-only: frees a profile slot (brief 10).
app.delete("/profiles/:profileId", async (c) => {
  const userId = await requireUserId(c);
  const profileId = uuidParam.parse(c.req.param("profileId"));
  await deleteProfile(profileIdentityDeps, userId, profileId);
  return c.json({ removed: true });
});

// "Your links" (design-out socials row) — Admin-only, replace-all semantics.
app.put("/profiles/:profileId/links", async (c) => {
  const userId = await requireUserId(c);
  const input = setProfileLinksInput.parse({
    ...(await c.req.json()),
    profileId: c.req.param("profileId"),
  });
  await setProfileLinks(profileLinkDeps, userId, input);
  return c.json({ saved: true });
});
