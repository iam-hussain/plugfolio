import { Hono } from "hono";
import { z } from "zod";
import {
  agreeCollab,
  approachRequirement,
  approachRequirementInput,
  closeRequirement,
  collabMessageInput,
  createBusiness,
  createBusinessInput,
  postRequirement,
  postRequirementInput,
  proposeCollabTerms,
  proposeTermsInput,
  requestCollab,
  requestCollabInput,
  sendCollabMessage,
} from "@plugfolio/core";
import { requireUserId } from "../auth";
import { businessCollabDeps } from "../container";

/**
 * The business side of the collab loop (lean journey): create the business,
 * post a requirement (door one) or approach a creator (door two), then bargain
 * in a thread and agree. Money stays off-platform (§2.3).
 */
export const businessCollabRoutes = new Hono();

const uuidParam = z.string().uuid();

businessCollabRoutes.post("/businesses", async (c) => {
  const userId = await requireUserId(c);
  const input = createBusinessInput.parse(await c.req.json());
  const business = await createBusiness(businessCollabDeps, userId, input);
  return c.json({ business }, 201);
});

businessCollabRoutes.post("/requirements", async (c) => {
  const userId = await requireUserId(c);
  const input = postRequirementInput.parse(await c.req.json());
  const requirement = await postRequirement(businessCollabDeps, userId, input);
  return c.json({ requirement }, 201);
});

businessCollabRoutes.post("/collabs/approach", async (c) => {
  const userId = await requireUserId(c);
  const input = approachRequirementInput.parse(await c.req.json());
  const collabId = await approachRequirement(businessCollabDeps, userId, input);
  return c.json({ collabId }, 201);
});

businessCollabRoutes.post("/collabs/request", async (c) => {
  const userId = await requireUserId(c);
  const input = requestCollabInput.parse(await c.req.json());
  const collabId = await requestCollab(businessCollabDeps, userId, input);
  return c.json({ collabId }, 201);
});

businessCollabRoutes.post("/collabs/:collabId/messages", async (c) => {
  const userId = await requireUserId(c);
  const collabId = uuidParam.parse(c.req.param("collabId"));
  const input = collabMessageInput.parse(await c.req.json());
  await sendCollabMessage(businessCollabDeps, userId, collabId, input);
  return c.json({ sent: true }, 201);
});

businessCollabRoutes.post("/collabs/:collabId/agree", async (c) => {
  const userId = await requireUserId(c);
  const collabId = uuidParam.parse(c.req.param("collabId"));
  await agreeCollab(businessCollabDeps, userId, collabId);
  return c.json({ agreed: true });
});

// Propose terms (brief 12): either side; resets both agreements.
businessCollabRoutes.post("/collabs/:collabId/terms", async (c) => {
  const userId = await requireUserId(c);
  const collabId = uuidParam.parse(c.req.param("collabId"));
  const input = proposeTermsInput.parse(await c.req.json());
  await proposeCollabTerms(businessCollabDeps, userId, collabId, input);
  return c.json({ proposed: true });
});

// Close a requirement (brief 11): off the board; threads persist.
businessCollabRoutes.post("/requirements/:requirementId/close", async (c) => {
  const userId = await requireUserId(c);
  const requirementId = uuidParam.parse(c.req.param("requirementId"));
  await closeRequirement(businessCollabDeps, userId, requirementId);
  return c.json({ closed: true });
});
