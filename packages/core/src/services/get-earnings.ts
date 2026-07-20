import type { EarningsReadRepository, EarningsSummary } from "../ports/earnings-repository";

/**
 * Earnings read use-case. Thin today: the projection lives in the repository
 * (it's an aggregation query). The creator dashboard calls this; when access
 * rules land with auth (Admin/Manager), they enforce here — pages still never
 * touch a repository.
 */
export type EarningsReadDeps = {
  earnings: EarningsReadRepository;
};

export async function getEarnings(
  deps: EarningsReadDeps,
  profileId: string,
): Promise<EarningsSummary> {
  return deps.earnings.summarize(profileId);
}
