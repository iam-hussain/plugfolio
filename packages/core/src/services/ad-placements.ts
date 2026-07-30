import type { AdPlacement, AdPlacementRepository } from "../ports/ad-placement-repository";
import type { AppSettingsRepository } from "../ports/admin-repository";
import type { CreateAdPlacementInput } from "../schemas/ad-placement";
import { isFeatureEnabled } from "./app-settings";

/**
 * Sponsored placements (ADR-0020) — admin-placed, never a plan.
 *
 * The read is gated on the `ads` flag, and that flag defaults to **false**.
 * Every other flag defaults on; this one is the exception, because "we forgot
 * it was on" is a much worse failure for an ad than for comments.
 */
export type AdPlacementDeps = {
  ads: AdPlacementRepository;
  settings: AppSettingsRepository;
  now: () => Date;
};

export const ADS_FLAG = "ads";

/** Null whenever ads are off, or nothing is live. Callers render nothing. */
export async function getLiveAdPlacement(deps: AdPlacementDeps): Promise<AdPlacement | null> {
  if (!(await isFeatureEnabled({ settings: deps.settings }, ADS_FLAG, false))) return null;
  return deps.ads.findLive(deps.now());
}

export async function listAdPlacements(
  deps: Pick<AdPlacementDeps, "ads">,
): Promise<readonly AdPlacement[]> {
  return deps.ads.list();
}

export async function createAdPlacement(
  deps: Pick<AdPlacementDeps, "ads" | "now">,
  input: CreateAdPlacementInput,
): Promise<AdPlacement> {
  return deps.ads.create({
    title: input.title,
    description: input.description ?? null,
    imageUrl: input.imageUrl ?? null,
    url: input.url,
    activeFrom: input.activeFrom ?? deps.now(),
    activeUntil: input.activeUntil ?? null,
  });
}

export async function removeAdPlacement(
  deps: Pick<AdPlacementDeps, "ads">,
  id: string,
): Promise<void> {
  await deps.ads.remove(id);
}
