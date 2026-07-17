import type { OutboundTap } from "../domain/tap";
import type { TapRepository } from "../ports/tap-repository";
import { recordOutboundTapInput, type RecordOutboundTapInput } from "../schemas/tap";

/**
 * A service is one use-case (§6.3): validate → orchestrate domain + repository →
 * return. This is the "verb" `recordOutboundTap`. It is pure of framework
 * concerns; the HTTP layer calls it after parsing the request.
 *
 * Dependencies are injected (the repository port), so the service is trivially
 * unit-testable with an in-memory fake and knows nothing about Prisma or Next.
 */
export type RecordOutboundTapDeps = {
  taps: TapRepository;
  /** Injected clock keeps the service deterministic under test. */
  now: () => Date;
};

export async function recordOutboundTap(
  deps: RecordOutboundTapDeps,
  rawInput: RecordOutboundTapInput,
): Promise<OutboundTap> {
  const input = recordOutboundTapInput.parse(rawInput);

  // Idempotency (§6.8): in-app browsers double-fire — a retry with the same key
  // returns the original event rather than recording a second tap.
  const existing = await deps.taps.findByIdempotencyKey(input.idempotencyKey);
  if (existing) return existing;

  return deps.taps.append({
    productId: input.productId,
    profileId: input.profileId,
    deviceToken: input.deviceToken,
    idempotencyKey: input.idempotencyKey,
    source: input.source,
    occurredAt: deps.now(),
  });
}
