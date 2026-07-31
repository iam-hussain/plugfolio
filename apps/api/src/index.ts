import { serve } from "@hono/node-server";
import { app } from "./app";
import { env } from "./env";

// ponytail: runs TS directly via tsx, deliberately. The deploy target is a
// plain Node host (ADR-0008 § Deployment), not a platform that needs a bundle,
// so a build step would buy ~1s of boot and cost a pipeline. Revisit if boot
// time or the box's memory starts mattering.
serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`[api] listening on :${info.port}`);
});
