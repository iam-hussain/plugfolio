import type { CommentView } from "@plugfolio/core";

/** Server-rendered comment list — reading needs no account (§2.2). */
export type CommentListProps = {
  comments: readonly CommentView[];
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

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-muted-foreground text-sm">No comments yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {comments.map((comment) => (
        <li key={comment.id} className="text-sm">
          <CommentIdentity comment={comment} />{" "}
          <span className="text-muted-foreground">{comment.body}</span>
        </li>
      ))}
    </ul>
  );
}
