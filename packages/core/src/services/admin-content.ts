import { NotFoundError } from "../errors";
import type {
  AdminAuditRepository,
  AdminCommentRow,
  AdminContentRepository,
  AdminPostRow,
  AdminProductRow,
} from "../ports/admin-repository";

/**
 * Content takedowns (docs/implementation/admin-app.md): remove what breaks
 * the rules — spam comments, stolen media, counterfeit product links — and
 * leave an audited trail. Deletions follow the same cascades the creator's
 * own removals use; nothing here is a soft-delete.
 */

export type AdminContentDeps = {
  content: AdminContentRepository;
  audit: AdminAuditRepository;
};

const SEARCH_LIMIT = 50;
/** Enough of the removed thing to recognize it in the audit log. */
const DETAIL_SNIPPET_LENGTH = 80;

function snippet(text: string): string {
  return text.length > DETAIL_SNIPPET_LENGTH
    ? `${text.slice(0, DETAIL_SNIPPET_LENGTH)}…`
    : text;
}

export async function searchComments(
  deps: Pick<AdminContentDeps, "content">,
  query?: string,
): Promise<readonly AdminCommentRow[]> {
  return deps.content.searchComments(query?.trim() || undefined, SEARCH_LIMIT);
}

export async function searchPosts(
  deps: Pick<AdminContentDeps, "content">,
  query?: string,
): Promise<readonly AdminPostRow[]> {
  return deps.content.searchPosts(query?.trim() || undefined, SEARCH_LIMIT);
}

export async function searchProducts(
  deps: Pick<AdminContentDeps, "content">,
  query?: string,
): Promise<readonly AdminProductRow[]> {
  return deps.content.searchProducts(query?.trim() || undefined, SEARCH_LIMIT);
}

export async function deleteComment(
  deps: AdminContentDeps,
  adminId: string,
  commentId: string,
): Promise<void> {
  const deleted = await deps.content.deleteComment(commentId);
  if (deleted === "not_found") throw new NotFoundError("No such comment");
  await deps.audit.record({
    adminId,
    action: "comment.delete",
    targetType: "comment",
    targetId: commentId,
    detail: snippet(deleted.body),
  });
}

export async function deletePost(
  deps: AdminContentDeps,
  adminId: string,
  postId: string,
): Promise<void> {
  if ((await deps.content.deletePost(postId)) === "not_found") {
    throw new NotFoundError("No such post");
  }
  await deps.audit.record({ adminId, action: "post.delete", targetType: "post", targetId: postId });
}

export async function deleteProduct(
  deps: AdminContentDeps,
  adminId: string,
  productId: string,
): Promise<void> {
  const deleted = await deps.content.deleteProduct(productId);
  if (deleted === "not_found") throw new NotFoundError("No such product");
  await deps.audit.record({
    adminId,
    action: "product.delete",
    targetType: "product",
    targetId: productId,
    detail: snippet(deleted.title),
  });
}

export async function clearProductCoupon(
  deps: AdminContentDeps,
  adminId: string,
  productId: string,
): Promise<void> {
  if ((await deps.content.clearCoupon(productId)) === "not_found") {
    throw new NotFoundError("No such product");
  }
  await deps.audit.record({
    adminId,
    action: "product.clearCoupon",
    targetType: "product",
    targetId: productId,
  });
}
