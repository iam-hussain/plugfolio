import type { TrafficReadRepository, TrafficSummary } from "../ports/traffic-repository";

/**
 * Traffic read use-case. Thin today: the projection lives in the repository
 * (it's an aggregation query). The creator dashboard calls this; when access
 * rules land with auth (Admin/Manager), they enforce here — pages still never
 * touch a repository.
 */
export type TrafficReadDeps = {
  traffic: TrafficReadRepository;
};

export async function getTraffic(
  deps: TrafficReadDeps,
  profileId: string,
): Promise<TrafficSummary> {
  return deps.traffic.summarize(profileId);
}

/**
 * Taps ÷ views, as a percentage to one decimal. The only one of the three
 * figures a creator can act on — and the reason views and taps are never shown
 * apart. No views means no rate, which is not the same claim as 0%.
 */
export function tapThroughRate(summary: {
  readonly totalViews: number;
  readonly totalTaps: number;
}): number | null {
  if (summary.totalViews <= 0) return null;
  return Math.round((summary.totalTaps / summary.totalViews) * 1000) / 10;
}
