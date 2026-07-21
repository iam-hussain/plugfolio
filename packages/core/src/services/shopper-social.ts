import { ForbiddenError, NotFoundError } from "../errors";
import type { CommentRepository, CommentView } from "../ports/comment-repository";
import type { FollowRepository } from "../ports/follow-repository";
import type { ProfileRepository, ProfileSummary } from "../ports/profile-repository";
import type { AddCommentInput } from "../schemas/shopper-social";

/**
 * The shopper-account use-cases (§2.2: follow and comment are the ONLY things
 * behind that door in v1). Callers pass the session-verified userId — never a
 * client-supplied one.
 */
export type ShopperSocialDeps = {
  follows: FollowRepository;
  comments: CommentRepository;
  profiles: ProfileRepository;
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
  input: AddCommentInput,
): Promise<CommentView> {
  if (!(await deps.profiles.exists(input.profileId))) {
    throw new NotFoundError("Profile not found");
  }
  // ADR-0009: speaking AS a profile requires membership (Admin or Manager) —
  // the client's pick is never trusted.
  const asProfileId = input.asProfileId ?? null;
  if (asProfileId) {
    const memberships = await deps.profiles.listAccessibleByUser(userId);
    if (!memberships.some((profile) => profile.id === asProfileId)) {
      throw new ForbiddenError("Not your profile");
    }
  }
  return deps.comments.add({ profileId: input.profileId, userId, asProfileId, body: input.body });
}

export async function getComments(
  deps: Pick<ShopperSocialDeps, "comments">,
  profileId: string,
): Promise<readonly CommentView[]> {
  return deps.comments.listByProfile(profileId, COMMENTS_PAGE_SIZE);
}
