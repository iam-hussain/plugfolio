import { NotFoundError } from "../errors";
import type { CodeCopy, CodeCopyRepository } from "../ports/code-copy-repository";
import type { ProductReadRepository } from "../ports/product-repository";
import type { RecordCodeCopyCommand } from "../schemas/code-copy";

/**
 * Record a coupon-code copy (ADR-0011) — the second attribution event, with
 * exactly the tap service's integrity rules: profile derived from the product,
 * post membership verified, idempotent on the key (§6.6, §6.8).
 */
export type RecordCodeCopyDeps = {
  codeCopies: CodeCopyRepository;
  products: ProductReadRepository;
  now: () => Date;
};

export async function recordCodeCopy(
  deps: RecordCodeCopyDeps,
  command: RecordCodeCopyCommand,
): Promise<CodeCopy> {
  const product = await deps.products.findForAttribution(command.productId);
  if (!product) throw new NotFoundError("Product not found");
  // A copy on a code-less product is a forged event, not a race.
  if (!product.couponCode) throw new NotFoundError("Product has no coupon");

  if (command.postId && !(await deps.products.isTaggedToPost(product.id, command.postId))) {
    throw new NotFoundError("Product is not tagged in this post");
  }

  const existing = await deps.codeCopies.findByIdempotencyKey(command.idempotencyKey);
  if (existing) return existing;

  return deps.codeCopies.append({
    productId: product.id,
    postId: command.postId ?? null,
    profileId: product.profileId,
    deviceId: command.deviceId,
    idempotencyKey: command.idempotencyKey,
    occurredAt: deps.now(),
  });
}
