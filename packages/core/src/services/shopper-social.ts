import { AppError, ForbiddenError, NotFoundError } from "../errors";
import type { CommentRepository, CommentThread, CommentView } from "../ports/comment-repository";
import type { FollowRepository } from "../ports/follow-repository";
import type { ProductReadRepository } from "../ports/product-repository";
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
  /** For validating product-comment targets (ADR-0013). */
  products: ProductReadRepository;
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
  // ADR-0013: a product comment must target a product of THIS profile.
  const productId = input.productId ?? null;
  if (productId) {
    const product = await deps.products.findForAttribution(productId);
    if (!product || product.profileId !== input.profileId) {
      throw new NotFoundError("Product not found");
    }
  }
  // ADR-0013: one-level threads — a reply's parent must be a top-level comment
  // on the same target (same page, same product-or-page level).
  const parentId = input.parentId ?? null;
  if (parentId) {
    const parent = await deps.comments.findTarget(parentId);
    if (!parent || parent.profileId !== input.profileId || parent.productId !== productId) {
      throw new NotFoundError("Comment not found");
    }
    if (parent.parentId !== null) {
      throw new AppError("VALIDATION", "Replies can't be nested further");
    }
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
  return deps.comments.add({
    profileId: input.profileId,
    productId,
    parentId,
    userId,
    asProfileId,
    body: input.body,
  });
}

export async function getComments(
  deps: Pick<ShopperSocialDeps, "comments">,
  profileId: string,
): Promise<readonly CommentThread[]> {
  return deps.comments.listByProfile(profileId, COMMENTS_PAGE_SIZE);
}

export async function getProductComments(
  deps: Pick<ShopperSocialDeps, "comments">,
  productId: string,
): Promise<readonly CommentThread[]> {
  return deps.comments.listByProduct(productId, COMMENTS_PAGE_SIZE);
}
