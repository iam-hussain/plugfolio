import { NotFoundError } from "../errors";
import type { View, ViewRepository, ViewTargetRepository } from "../ports/view-repository";
import type { RecordViewCommand } from "../schemas/view";

/**
 * Record a shoppable surface opening — the denominator taps never had.
 *
 * Same three integrity rules as the tap service (§6.6, §6.8): the profile is
 * derived from what was opened rather than supplied, a target that doesn't
 * exist is a 404 rather than a silent no-op, and the write is idempotent on
 * the key because in-app browsers double-fire.
 */
export type RecordViewDeps = {
  views: ViewRepository;
  viewTargets: ViewTargetRepository;
  now: () => Date;
};

export async function recordView(deps: RecordViewDeps, command: RecordViewCommand): Promise<View> {
  const profileId =
    command.surface === "profile"
      ? await deps.viewTargets.profileIdForUsername(command.username)
      : command.surface === "post"
        ? await deps.viewTargets.profileIdForPost(command.postId)
        : await deps.viewTargets.profileIdForProduct(command.productId);
  if (!profileId) throw new NotFoundError("Nothing to count a view against");

  const existing = await deps.views.findByIdempotencyKey(command.idempotencyKey);
  if (existing) return existing;

  return deps.views.append({
    profileId,
    postId: command.surface === "post" ? command.postId : null,
    productId: command.surface === "product" ? command.productId : null,
    deviceId: command.deviceId,
    idempotencyKey: command.idempotencyKey,
    surface: command.surface,
    referrer: command.referrer?.trim() ? command.referrer.trim() : null,
    occurredAt: deps.now(),
  });
}
