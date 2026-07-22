import type { CommentThread, CommentView } from "@plugfolio/core";
import type { CommentIdentityOption } from "./comment-form";
import { ReplyToggle } from "./reply-toggle";

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
};

/** ADR-0009: a comment speaks as a profile (brand + Creator badge) or as the
 * author's @member-handle. The email is never rendered. */
function CommentIdentity({ comment }: { comment: CommentView }) {
  if (comment.asProfile) {
    return (
      <>
        <span className="font-medium">{comment.asProfile.username}</span>{" "}
        <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] font-medium">
          Creator
        </span>
      </>
    );
  }
  return (
    <>
      <span className="font-medium">{comment.author.name ?? `@${comment.author.handle}`}</span>
      {comment.author.name ? (
        <span className="text-muted-foreground text-xs"> @{comment.author.handle}</span>
      ) : null}
    </>
  );
}

function CommentBody({ comment }: { comment: CommentView }) {
  return (
    <p className="text-sm">
      <CommentIdentity comment={comment} />{" "}
      <span className="text-muted-foreground">{comment.body}</span>
    </p>
  );
}

export function CommentList({ comments, replyContext }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-muted-foreground text-sm">No comments yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.id} className="flex flex-col gap-1">
          <CommentBody comment={comment} />
          {comment.replies.length > 0 ? (
            <ul className="border-border flex flex-col gap-2 border-l pl-3 pt-1">
              {comment.replies.map((reply) => (
                <li key={reply.id}>
                  <CommentBody comment={reply} />
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
