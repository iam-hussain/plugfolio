import type { CommentView } from "@plugfolio/core";

/** Server-rendered comment list — reading needs no account (§2.2). */
export type CommentListProps = {
  comments: readonly CommentView[];
};

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-muted-foreground text-sm">No comments yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {comments.map((comment) => (
        <li key={comment.id} className="text-sm">
          <span className="font-medium">{comment.authorName ?? "Shopper"}</span>{" "}
          <span className="text-muted-foreground">{comment.body}</span>
        </li>
      ))}
    </ul>
  );
}
