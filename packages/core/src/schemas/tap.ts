import { z } from "zod";

/**
 * Zod schema for the CLIENT-supplied part of recording an outbound tap (§6.4
 * validate at the boundary). Note what is deliberately absent:
 *
 * - `profileId` is NOT accepted — attribution is derived server-side from the
 *   product (§6.6), so a forged/mismatched profile can't misattribute earnings.
 * - the device identity is NOT accepted — it comes from the signed, HTTP-only
 *   device cookie, verified server-side (§6.7, ADR-0002), never from the body.
 */
export const recordOutboundTapInput = z.object({
  /** The tagged product being tapped through to its affiliate destination. */
  productId: z.string().uuid(),
  /**
   * The post that drove the tap, for per-post earnings ("this reel drove 312
   * taps"). Optional — profile-/product-surface taps have no post. The service
   * verifies the post actually has this product tagged, so a client can't file
   * taps under an unrelated post.
   */
  postId: z.string().uuid().optional(),
  /** Idempotency key; in-app browsers double-fire taps (§6.8). */
  idempotencyKey: z.string().uuid(),
  /** Where the tap happened, for the read model. */
  source: z.enum(["profile", "post", "product"]),
});

export type RecordOutboundTapInput = z.infer<typeof recordOutboundTapInput>;

/**
 * The full command the service acts on: the validated client input plus the
 * server-verified device identity. The HTTP layer builds this after verifying
 * the device cookie; `deviceId` never originates from the request body.
 */
export type RecordOutboundTapCommand = RecordOutboundTapInput & {
  readonly deviceId: string;
};
