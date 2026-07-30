import { z } from "zod";

/**
 * Recording a view — the client-supplied part only (§6.4). What's absent is
 * the point, and it mirrors the tap boundary exactly:
 *
 * - no `profileId`: the service derives it from the thing that was opened, so
 *   a forged body can't inflate somebody else's numbers (or its own);
 * - no device identity: it comes from the signed device cookie (§6.7,
 *   ADR-0002), never the body.
 *
 * A discriminated union rather than three optional ids, because "a post view
 * with no post" is a shape the type system can simply refuse.
 */
export const recordViewInput = z.discriminatedUnion("surface", [
  z.object({
    surface: z.literal("profile"),
    /** The handle in the URL — the only id a public page knows about itself. */
    username: z.string().min(1),
    idempotencyKey: z.string().uuid(),
  }),
  z.object({
    surface: z.literal("post"),
    postId: z.string().uuid(),
    idempotencyKey: z.string().uuid(),
  }),
  z.object({
    surface: z.literal("product"),
    productId: z.string().uuid(),
    idempotencyKey: z.string().uuid(),
  }),
]);

export type RecordViewInput = z.infer<typeof recordViewInput>;

export type RecordViewCommand = RecordViewInput & {
  readonly deviceId: string;
};
