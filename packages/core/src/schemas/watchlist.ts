import { z } from "zod";

/**
 * Boundary schema (§6.4) for the watchlist. The saver is NEVER accepted from
 * the body — it comes from the verified session; this validates only what the
 * client legitimately chooses: which thing, of which kind.
 */
export const watchKind = z.enum(["post", "product"]);
export type WatchKind = z.infer<typeof watchKind>;

export const watchTargetInput = z.object({
  kind: watchKind,
  targetId: z.string().uuid(),
});

export type WatchTargetInput = z.infer<typeof watchTargetInput>;
