import type { ProfileReadRepository, ProfileSummary } from "../ports/profile-repository";

/**
 * The signed-in user's profiles — the dashboard's scoping read. Everything
 * dashboard-shaped must resolve its profile from this list, never from
 * untrusted input; that is what keeps one creator out of another's earnings.
 */
export type ProfileReadDeps = {
  profiles: ProfileReadRepository;
};

export async function getMyProfiles(
  deps: ProfileReadDeps,
  userId: string,
): Promise<readonly ProfileSummary[]> {
  return deps.profiles.listByUser(userId);
}
