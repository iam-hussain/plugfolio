import { z } from "zod";

/**
 * Recording a coupon-code copy (ADR-0011) — the second attribution event.
 * Mirrors the tap boundary rules (§6.4): no profileId (derived from the
 * product), no device identity (comes from the verified cookie, never the body).
 */
export const recordCodeCopyInput = z.object({
  productId: z.string().uuid(),
  /** The post the copy happened on, when it did — same integrity check as taps. */
  postId: z.string().uuid().optional(),
  /** Idempotency key; in-app browsers double-fire (§6.8). */
  idempotencyKey: z.string().uuid(),
});

export type RecordCodeCopyInput = z.infer<typeof recordCodeCopyInput>;

export type RecordCodeCopyCommand = RecordCodeCopyInput & {
  readonly deviceId: string;
};
