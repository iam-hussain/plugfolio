import { Hono } from "hono";
import { toErrorShape } from "@plugfolio/core";
import { accountRoutes } from "./routes/account";
import { attributionRoutes } from "./routes/attribution";
import { businessCollabRoutes } from "./routes/business-collab";
import { categoryRoutes } from "./routes/categories";
import { creatorContentRoutes } from "./routes/creator-content";
import { intakeRoutes } from "./routes/intake";
import { profileRoutes } from "./routes/profiles";
import { shopperSocialRoutes } from "./routes/shopper-social";

/**
 * The standalone REST API (ADR-0008, ADR-0006): thin controllers only —
 * verify identity → validate with Zod → call one service → shape response
 * (§6.3). Served under /api so the web app's same-origin proxy and future
 * mobile clients hit identical paths. Business logic lives in @plugfolio/core.
 *
 * Routes are grouped by domain into `./routes/*` sub-routers; this file only
 * composes them and maps thrown errors to the wire shape.
 */
export const app = new Hono().basePath("/api");

app.onError((error, c) => {
  const { status, body } = toErrorShape(error);
  return c.json(body, status);
});

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/", accountRoutes);
app.route("/", attributionRoutes);
app.route("/", shopperSocialRoutes);
app.route("/", intakeRoutes);
app.route("/", businessCollabRoutes);
app.route("/", creatorContentRoutes);
app.route("/", categoryRoutes);
app.route("/", profileRoutes);
