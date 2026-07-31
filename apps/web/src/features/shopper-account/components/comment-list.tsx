import type { CommentThread, CommentView } from "@plugfolio/core";
import type { CommentIdentityOption } from "./comment-form";
import { CommentReactions } from "./comment-reactions";
import { ReplyToggle } from "./reply-toggle";
import { ReportButton } from "@/features/reporting";

/**
 * Server-rendered comment threads — reading needs no account (§2.2).
 * ADR-0013: one level of replies, rendered indented under their parent.
 */
export type CommentReplyContext = {
  profileId: string;
  productId?: string;
  ownHandle: string;
  identities: readonly CommentIdentityOption[];
  defaultAsProfileId: string | null;
};

export type CommentListProps = {
  comments: readonly CommentThread[];
  /** Present only for signed-in viewers — enables the Reply affordance. */
  replyContext?: CommentReplyContext | null;
  /** Reacting needs an account; reading the counts never does (§2.2). */
  signedIn?: boolean;
};

/** ADR-0009: a comment speaks as a profile (brand + Creator badge) or as the
 * author's @member-handle. The email is never rendered. */
function CommentIdentity({ comment }: { comment: CommentView }) {
  if (comment.asProfile) {
    return (
      <>
        <span className="font-medium">{comment.asProfile.username}</span>{" "}
        <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-pico font-medium">
          Creator
        </span>
      </>
    );
  }
  return (
    <>
      <span className="font-medium">{comment.author.name ?? `@${comment.author.handle}`}</span>
      {comment.author.name ? (
        <span className="text-muted-foreground text-micro"> @{comment.author.handle}</span>
      ) : null}
    </>
  );
}

function CommentBody({ comment }: { comment: CommentView }) {
  return (
    <div className="group flex items-start gap-1">
      <p className="text-copy">
        <CommentIdentity comment={comment} />{" "}
        <span className="text-muted-foreground">{comment.body}</span>
      </p>
      <span className="opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <ReportButton targetType="comment" targetId={comment.id} targetLabel="this comment" iconOnly />
      </span>
    </div>
  );
}

export function CommentList({ comments, replyContext, signedIn = false }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-muted-foreground text-copy">No comments yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.id} className="flex flex-col gap-1">
          <CommentBody comment={comment} />
          <CommentReactions
            commentId={comment.id}
            helpfulCount={comment.helpfulCount}
            unhelpfulCount={comment.unhelpfulCount}
            mine={comment.myReaction}
            signedIn={signedIn}
          />
          {comment.replies.length > 0 ? (
            <ul className="border-border flex flex-col gap-2 border-l pl-3 pt-1">
              {comment.replies.map((reply) => (
                <li key={reply.id}>
                  <CommentBody comment={reply} />
                  <CommentReactions
                    commentId={reply.id}
                    helpfulCount={reply.helpfulCount}
                    unhelpfulCount={reply.unhelpfulCount}
                    mine={reply.myReaction}
                    signedIn={signedIn}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {replyContext ? (
            <div>
              <ReplyToggle
                profileId={replyContext.profileId}
                productId={replyContext.productId}
                parentId={comment.id}
                ownHandle={replyContext.ownHandle}
                identities={replyContext.identities}
                defaultAsProfileId={replyContext.defaultAsProfileId}
              />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
