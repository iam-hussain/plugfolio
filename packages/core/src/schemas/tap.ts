import { z } from "zod";

/**
 * Zod schema for recording an outbound tap (§6.4 validate at the boundary).
 * The inferred type flows inward as the service input — one source for runtime
 * validation and the compile-time contract.
 */
export const recordOutboundTapInput = z.object({
  /** The tagged product being tapped through to its affiliate destination. */
  productId: z.string().uuid(),
  /** The creator profile the tap is attributed to. */
  profileId: z.string().uuid(),
  /** Signed anonymous device token — NOT an account (§6.7, ADR-0002). */
  deviceToken: z.string().min(1),
  /** Idempotency key; in-app browsers double-fire taps (§6.8). */
  idempotencyKey: z.string().uuid(),
  /** Where the tap happened, for the read model. */
  source: z.enum(["profile", "post", "product"]),
});

export type RecordOutboundTapInput = z.infer<typeof recordOutboundTapInput>;
