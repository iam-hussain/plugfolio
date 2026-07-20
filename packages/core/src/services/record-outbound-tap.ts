import { NotFoundError } from "../errors";
import type { OutboundTap } from "../domain/tap";
import type { ProductReadRepository } from "../ports/product-repository";
import type { TapRepository } from "../ports/tap-repository";
import type { RecordOutboundTapCommand } from "../schemas/tap";

/**
 * A service is one use-case (§6.3): validate → orchestrate domain + repository →
 * return. This is the "verb" `recordOutboundTap`. It is pure of framework
 * concerns; the HTTP layer calls it after parsing the body and verifying the
 * device cookie.
 *
 * Dependencies are injected (the repository ports), so the service is trivially
 * unit-testable with in-memory fakes and knows nothing about Prisma or Next.
 */
export type RecordOutboundTapDeps = {
  taps: TapRepository;
  products: ProductReadRepository;
  /** Injected clock keeps the service deterministic under test. */
  now: () => Date;
};

export async function recordOutboundTap(
  deps: RecordOutboundTapDeps,
  command: RecordOutboundTapCommand,
): Promise<OutboundTap> {
  // Attribution integrity (§6.6): the crediting profile is derived from the
  // product, NOT taken from the client — so a request can't credit an unrelated
  // profile's earnings. An unknown product is a 404, not a silent miscredit.
  const product = await deps.products.findForAttribution(command.productId);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  // Per-post attribution integrity: only accept a post that actually has this
  // product tagged, so per-post earnings can't be skewed by a forged postId.
  if (command.postId && !(await deps.products.isTaggedToPost(product.id, command.postId))) {
    throw new NotFoundError("Product is not tagged in this post");
  }

  // Idempotency (§6.8): in-app browsers double-fire — a retry with the same key
  // returns the original event rather than recording a second tap.
  const existing = await deps.taps.findByIdempotencyKey(command.idempotencyKey);
  if (existing) return existing;

  return deps.taps.append({
    productId: product.id,
    postId: command.postId ?? null,
    profileId: product.profileId,
    deviceId: command.deviceId,
    idempotencyKey: command.idempotencyKey,
    source: command.source,
    occurredAt: deps.now(),
  });
}
