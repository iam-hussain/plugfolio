import type { NewOutboundTap, OutboundTap } from "../domain/tap";

/**
 * Port (interface) for tap persistence. `core` depends on this abstraction;
 * the Prisma implementation lives in `@plugfolio/db` (§6.2 repository pattern —
 * Prisma is imported ONLY in repositories). Swapping storage never touches
 * services.
 */
export type TapRepository = {
  /**
   * Append a tap. Must be idempotent on `idempotencyKey`: whether the caller
   * already recorded it, or a concurrent request wins the insert race, the
   * already-recorded tap is returned rather than a duplicate or an error (§6.8).
   */
  append(tap: NewOutboundTap): Promise<OutboundTap>;
  findByIdempotencyKey(key: string): Promise<OutboundTap | null>;
};
