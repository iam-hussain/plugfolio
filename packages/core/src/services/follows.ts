import { NotFoundError } from "../errors";
import type { FollowRepository } from "../ports/follow-repository";
import type { ProfileRepository, ProfileSummary } from "../ports/profile-repository";

/**
 * Follow use-cases (§2.2: follow is one of the two things behind the account
 * door in v1). Callers pass the session-verified userId — never a client-
 * supplied one.
 */
export type FollowDeps = {
  follows: FollowRepository;
  profiles: ProfileRepository;
};

export async function followProfile(
  deps: FollowDeps,
  userId: string,
  profileId: string,
): Promise<void> {
  if (!(await deps.profiles.exists(profileId))) {
    throw new NotFoundError("Profile not found");
  }
  await deps.follows.add(userId, profileId);
}

export async function unfollowProfile(
  deps: Pick<FollowDeps, "follows">,
  userId: string,
  profileId: string,
): Promise<void> {
  await deps.follows.remove(userId, profileId);
}

export async function getFollowedProfiles(
  deps: Pick<FollowDeps, "follows">,
  userId: string,
): Promise<readonly ProfileSummary[]> {
  return deps.follows.listProfilesByUser(userId);
}

export async function isFollowingProfile(
  deps: Pick<FollowDeps, "follows">,
  userId: string,
  profileId: string,
): Promise<boolean> {
  return deps.follows.isFollowing(userId, profileId);
}
