import { AppError, ForbiddenError, NotFoundError } from "../errors";
import type {
  CommentPage,
  CommentQuery,
  CommentRepository,
  CommentView,
} from "../ports/comment-repository";
import type { ProductReadRepository } from "../ports/product-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import type { CommentSort, ReactToCommentInput } from "../schemas/comment-reaction";
import type { AddCommentInput } from "../schemas/shopper-social";

/**
 * Comment use-cases (§2.2: comment is the other thing behind the account door).
 * Writing needs the session-verified userId; reading is account-free and only
 * uses `viewerId` to decide `myReaction`.
 */
export type CommentDeps = {
  comments: CommentRepository;
  profiles: ProfileRepository;
  /** For validating product-comment targets (ADR-0013). */
  products: ProductReadRepository;
};

export const COMMENTS_PAGE_SIZE = 50;

export async function addComment(
  deps: CommentDeps,
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

/** Reading is account-free (§2.2); `viewerId` only decides `myReaction`. */
export type CommentReadOptions = {
  sort?: CommentSort;
  page?: number;
  viewerId?: string | null;
};

function toQuery(options: CommentReadOptions): CommentQuery {
  const page = Math.max(1, options.page ?? 1);
  return {
    sort: options.sort ?? "recent",
    limit: COMMENTS_PAGE_SIZE,
    skip: (page - 1) * COMMENTS_PAGE_SIZE,
    viewerId: options.viewerId ?? null,
  };
}

export async function getComments(
  deps: Pick<CommentDeps, "comments">,
  profileId: string,
  options: CommentReadOptions = {},
): Promise<CommentPage> {
  return deps.comments.listByProfile(profileId, toQuery(options));
}

export async function getProductComments(
  deps: Pick<CommentDeps, "comments">,
  productId: string,
  options: CommentReadOptions = {},
): Promise<CommentPage> {
  return deps.comments.listByProduct(productId, toQuery(options));
}

/**
 * Helpful / not helpful on a comment. Needs an account (it is an "act as
 * yourself" action, like follow and comment); the same value twice clears it,
 * which the client sends as `null` so the toggle stays the server's contract.
 */
export async function reactToComment(
  deps: Pick<CommentDeps, "comments">,
  userId: string,
  input: ReactToCommentInput,
): Promise<void> {
  if (!(await deps.comments.exists(input.commentId))) {
    throw new NotFoundError("Comment not found");
  }
  await deps.comments.setReaction(input.commentId, userId, input.value);
}
