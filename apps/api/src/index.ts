import { serve } from "@hono/node-server";
import { app } from "./app";
import { env } from "./env";

// ponytail: runs TS directly via tsx in dev and prod-for-now; a real build
// pipeline (tsc project refs or bundling) lands when the deploy target is
// chosen (ADR-0008).
serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`[api] listening on :${info.port}`);
});
