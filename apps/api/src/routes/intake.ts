import { Hono } from "hono";
import {
  ForbiddenError,
  createReport,
  createReportInput,
  createSupportTicket,
  createSupportTicketInput,
  isFeatureEnabled,
} from "@plugfolio/core";
import { deviceIdentity, sessionUserId } from "../auth";
import { repositories } from "../container";
import { setDeviceCookie } from "./device-cookie";

/**
 * Account-free intake queues: a report (admin moderation inflow) and a support
 * ticket. Both are account-free on purpose — a report rides the signed device
 * cookie, and support's top category is "I lost access to my email". A session,
 * if present, only enriches the record with the member's @handle.
 */
export const intakeRoutes = new Hono();

intakeRoutes.post("/reports", async (c) => {
  if (!(await isFeatureEnabled({ settings: repositories.settings }, "reports", true))) {
    throw new ForbiddenError("Reporting is switched off right now");
  }
  const input = createReportInput.parse(await c.req.json());
  const userId = await sessionUserId(c);
  const handle = userId ? await repositories.users.getHandle(userId) : null;
  await createReport({ reports: repositories.reportWrites }, input, { handle });
  const { issued } = deviceIdentity(c);
  setDeviceCookie(c, issued);
  return c.json({ reported: true }, 201);
});

intakeRoutes.post("/support", async (c) => {
  if (!(await isFeatureEnabled({ settings: repositories.settings }, "support", true))) {
    throw new ForbiddenError("Support requests are switched off right now");
  }
  const input = createSupportTicketInput.parse(await c.req.json());
  const userId = await sessionUserId(c);
  const handle = userId ? await repositories.users.getHandle(userId) : null;
  await createSupportTicket({ support: repositories.supportWrites }, input, { handle });
  return c.json({ received: true }, 201);
});
