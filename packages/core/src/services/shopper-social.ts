import { NotFoundError } from "../errors";
import type { CommentRepository, CommentView } from "../ports/comment-repository";
import type { FollowRepository } from "../ports/follow-repository";
import type { ProfileReadRepository, ProfileSummary } from "../ports/profile-repository";

/**
 * The shopper-account use-cases (§2.2: follow and comment are the ONLY things
 * behind that door in v1). Callers pass the session-verified userId — never a
 * client-supplied one.
 */
export type ShopperSocialDeps = {
  follows: FollowRepository;
  comments: CommentRepository;
  profiles: ProfileReadRepository;
};

const COMMENTS_PAGE_SIZE = 50;

export async function followProfile(
  deps: ShopperSocialDeps,
  userId: string,
  profileId: string,
): Promise<void> {
  if (!(await deps.profiles.exists(profileId))) {
    throw new NotFoundError("Profile not found");
  }
  await deps.follows.add(userId, profileId);
}

export async function unfollowProfile(
  deps: ShopperSocialDeps,
  userId: string,
  profileId: string,
): Promise<void> {
  await deps.follows.remove(userId, profileId);
}

export async function getFollowedProfiles(
  deps: Pick<ShopperSocialDeps, "follows">,
  userId: string,
): Promise<readonly ProfileSummary[]> {
  return deps.follows.listProfilesByUser(userId);
}

export async function isFollowingProfile(
  deps: Pick<ShopperSocialDeps, "follows">,
  userId: string,
  profileId: string,
): Promise<boolean> {
  return deps.follows.isFollowing(userId, profileId);
}

export async function addComment(
  deps: ShopperSocialDeps,
  userId: string,
  input: { profileId: string; body: string },
): Promise<CommentView> {
  if (!(await deps.profiles.exists(input.profileId))) {
    throw new NotFoundError("Profile not found");
  }
  return deps.comments.add({ profileId: input.profileId, userId, body: input.body });
}

export async function getComments(
  deps: Pick<ShopperSocialDeps, "comments">,
  profileId: string,
): Promise<readonly CommentView[]> {
  return deps.comments.listByProfile(profileId, COMMENTS_PAGE_SIZE);
}
