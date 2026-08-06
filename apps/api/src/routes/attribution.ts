import { Hono } from "hono";
import {
  recordCodeCopy,
  recordCodeCopyInput,
  recordOutboundTap,
  recordOutboundTapInput,
  recordView,
  recordViewInput,
} from "@plugfolio/core";
import { deviceIdentity } from "../auth";
import { clock, repositories } from "../container";
import { setDeviceCookie } from "./device-cookie";

/**
 * The three anonymous attribution events (ADR-0002, ADR-0011, ADR-0021): an
 * outbound tap, a coupon-code copy, and a shoppable surface opening. All three
 * share the signed device identity + idempotency rules and never touch a
 * session — the no-login shopper write (§2.2).
 */
export const attributionRoutes = new Hono();

attributionRoutes.post("/taps", async (c) => {
  const input = recordOutboundTapInput.parse(await c.req.json());
  const { deviceId, issued } = deviceIdentity(c);
  const tap = await recordOutboundTap(
    { taps: repositories.taps, products: repositories.products, now: clock.now },
    { ...input, deviceId },
  );
  setDeviceCookie(c, issued);
  return c.json({ tap }, 201);
});

// Same device-identity + idempotency rules as taps (ADR-0011).
attributionRoutes.post("/code-copies", async (c) => {
  const input = recordCodeCopyInput.parse(await c.req.json());
  const { deviceId, issued } = deviceIdentity(c);
  const copy = await recordCodeCopy(
    { codeCopies: repositories.codeCopies, products: repositories.products, now: clock.now },
    { ...input, deviceId },
  );
  setDeviceCookie(c, issued);
  return c.json({ copy }, 201);
});

// A shoppable surface opening — the denominator taps are read against, so it is
// counted the same way (ADR-0021).
attributionRoutes.post("/views", async (c) => {
  const input = recordViewInput.parse(await c.req.json());
  const { deviceId, issued } = deviceIdentity(c);
  const view = await recordView(
    { views: repositories.views, viewTargets: repositories.viewTargets, now: clock.now },
    { ...input, deviceId },
  );
  setDeviceCookie(c, issued);
  return c.json({ view }, 201);
});
