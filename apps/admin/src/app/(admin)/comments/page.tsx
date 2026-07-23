import { searchComments } from "@plugfolio/core";
import {
  ConfirmButton,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import type { Metadata } from "next";

import { SearchHeader } from "@/components/search-header";
import { repositories } from "@/server/container";
import { deleteCommentAction } from "./actions";

export const metadata: Metadata = { title: "Comments" };
export const dynamic = "force-dynamic";

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const comments = await searchComments({ content: repositories.content }, q);

  return (
    <div className="flex flex-col gap-6">
      <SearchHeader title="Comments" query={q} placeholder="Search text, author, page…" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Comment</TableHead>
            <TableHead>By</TableHead>
            <TableHead>On</TableHead>
            <TableHead>When</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell className="max-w-md">
                <p className="truncate text-sm">{comment.body}</p>
                {comment.replyCount > 0 ? (
                  <p className="text-muted-foreground text-xs">
                    {comment.replyCount} repl{comment.replyCount > 1 ? "ies" : "y"} (deleted with
                    it)
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                {comment.asProfileUsername ? (
                  <Badge variant="secondary">/{comment.asProfileUsername}</Badge>
                ) : (
                  <span className="font-mono text-xs">@{comment.authorHandle}</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-40 truncate text-xs">
                /{comment.pageUsername}
                {comment.productTitle ? ` · ${comment.productTitle}` : ""}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs tabular-nums">
                {comment.createdAt.toISOString().slice(0, 10)}
              </TableCell>
              <TableCell className="text-right">
                <form action={deleteCommentAction}>
                  <input type="hidden" name="commentId" value={comment.id} />
                  <ConfirmButton
                    size="sm"
                    variant="destructive"
                    message="Delete this comment (and its replies)? This can't be undone."
                  >
                    Delete
                  </ConfirmButton>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {comments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                No comments match.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
