import { Hono } from "hono";
import { z } from "zod";
import {
  deleteProfile,
  inviteManager,
  inviteManagerInput,
  removeManager,
  setProfileLinks,
  setProfileLinksInput,
  updateProfileIdentity,
  updateProfileIdentityInput,
} from "@plugfolio/core";
import { requireUserId } from "../auth";
import {
  accountAuthDeps,
  profileIdentityDeps,
  profileLinkDeps,
  profileManagerDeps,
} from "../container";

/**
 * Profile administration (ADR-0004: Admin-only settings surface). Managers
 * (invite/remove), public identity (edit/delete — a Manager may only change the
 * picture), and the replace-all "Your links" row.
 */
export const profileRoutes = new Hono();

const uuidParam = z.string().uuid();

profileRoutes.post("/profiles/:profileId/managers", async (c) => {
  const userId = await requireUserId(c);
  const input = inviteManagerInput.parse({
    ...(await c.req.json()),
    profileId: c.req.param("profileId"),
  });
  await inviteManager({ ...profileManagerDeps, auth: accountAuthDeps }, userId, input);
  return c.json({ invited: true }, 201);
});

profileRoutes.delete("/profiles/:profileId/managers/:managerUserId", async (c) => {
  const userId = await requireUserId(c);
  const profileId = uuidParam.parse(c.req.param("profileId"));
  const managerUserId = uuidParam.parse(c.req.param("managerUserId"));
  await removeManager(profileManagerDeps, userId, profileId, managerUserId);
  return c.json({ removed: true });
});

// Public identity (brief 10): Admin edits everything; a Manager only the picture.
profileRoutes.patch("/profiles/:profileId", async (c) => {
  const userId = await requireUserId(c);
  const input = updateProfileIdentityInput.parse({
    ...(await c.req.json()),
    profileId: c.req.param("profileId"),
  });
  await updateProfileIdentity(profileIdentityDeps, userId, input);
  return c.json({ updated: true });
});

// Destructive, Admin-only: frees a profile slot (brief 10).
profileRoutes.delete("/profiles/:profileId", async (c) => {
  const userId = await requireUserId(c);
  const profileId = uuidParam.parse(c.req.param("profileId"));
  await deleteProfile(profileIdentityDeps, userId, profileId);
  return c.json({ removed: true });
});

// "Your links" (design-out socials row) — Admin-only, replace-all semantics.
profileRoutes.put("/profiles/:profileId/links", async (c) => {
  const userId = await requireUserId(c);
  const input = setProfileLinksInput.parse({
    ...(await c.req.json()),
    profileId: c.req.param("profileId"),
  });
  await setProfileLinks(profileLinkDeps, userId, input);
  return c.json({ saved: true });
});
