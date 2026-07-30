import { z } from "zod";

/**
 * Helpful / not helpful on a COMMENT (lean journey). It scores an *answer* —
 * never a product and never a creator — which is the line that keeps it from
 * quietly becoming the star-rating trust layer that stays deferred.
 */
export const reactionValue = z.enum(["helpful", "unhelpful"]);
export type ReactionValue = z.infer<typeof reactionValue>;

export const reactToCommentInput = z.object({
  commentId: z.string().uuid(),
  /** Null clears the account's reaction — tapping the same one again undoes it. */
  value: reactionValue.nullable(),
});

export type ReactToCommentInput = z.infer<typeof reactToCommentInput>;

/** Sort order for a comment thread (lean journey: newest, oldest, most helpful). */
export const commentSort = z.enum(["recent", "oldest", "helpful"]);
export type CommentSort = z.infer<typeof commentSort>;
