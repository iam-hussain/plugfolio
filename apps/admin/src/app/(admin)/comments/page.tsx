import { searchComments } from "@plugfolio/core";
import {
  Badge,
  Button,
  ConfirmDialog,
  PageHeader,
  SearchField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import { Download } from "lucide-react";
import type { Metadata } from "next";
import { BulkAllCheckbox, BulkBar, BulkCheckbox, BulkSelect } from "@/components/bulk-select";
import { Panel } from "@/components/panel";
import { repositories } from "@/server/container";
import { bulkDeleteCommentsAction, deleteCommentAction } from "./actions";

export const metadata: Metadata = { title: "Comments" };
export const dynamic = "force-dynamic";

/** Newest-first stream: "Load more" grows the window by one page (design §3.3). */
const LOAD_STEP = 25;

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const limit = Math.max(LOAD_STEP, Number.parseInt(params.limit ?? "", 10) || LOAD_STEP);
  const { rows, total } = await searchComments(
    { content: repositories.content },
    params.q,
    limit,
  );
  const moreHref = `/comments?${new URLSearchParams({
    ...(params.q ? { q: params.q } : {}),
    limit: String(limit + LOAD_STEP),
  }).toString()}`;

  return (
    <BulkSelect>
      <PageHeader title="Comments" subtitle="Newest-first moderation stream.">
        <form className="flex flex-wrap items-center gap-2">
          <SearchField
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search text / author / page"
            className="w-[260px]"
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Search
          </Button>
          <Button asChild size="xs" variant="ghost-muted">
            <a href={`/comments/export${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`}>
              <Download aria-hidden className="size-[15px]" /> Export CSV
            </a>
          </Button>
        </form>
      </PageHeader>

      <BulkBar
        verb="Delete"
        pastVerb="Deleted"
        noun="comments"
        body="The action applies to every selected row, replies included. This cannot be undone. Recorded in the audit log."
        action={bulkDeleteCommentsAction}
      />

      <Panel className="overflow-hidden">
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[34px]">
                <BulkAllCheckbox ids={rows.map((r) => r.id)} />
              </TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>By</TableHead>
              <TableHead>On</TableHead>
              <TableHead>When</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="w-[34px]">
                  <BulkCheckbox id={comment.id} label="Select comment" />
                </TableCell>
                <TableCell className="max-w-[420px]">
                  <span className="block truncate leading-[1.4]">{comment.body}</span>
                  {comment.replyCount > 0 ? (
                    <span className="text-muted-foreground mt-0.5 block text-xs">
                      {comment.replyCount} repl{comment.replyCount > 1 ? "ies" : "y"} (deleted with
                      it)
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  {comment.asProfileUsername ? (
                    <Badge shape="square" variant="soft-primary" className="font-mono">
                      /{comment.asProfileUsername}
                    </Badge>
                  ) : (
                    <span className="font-mono text-muted-foreground text-xs">
                      @{comment.authorHandle}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate text-[12.5px]">
                  /{comment.pageUsername}
                  {comment.productTitle ? ` · ${comment.productTitle}` : ""}
                </TableCell>
                <TableCell className="font-mono text-faint text-[11.5px] tabular-nums">
                  {comment.createdAt.toISOString().replace("T", " ").slice(0, 16)}
                </TableCell>
                <TableCell className="text-right">
                  <ConfirmDialog
                    trigger={<Button size="xs" variant="destructive-outline">Delete</Button>}
                    title="Delete this comment?"
                    body="The comment and all of its replies are permanently deleted. This cannot be undone. Recorded in the audit log."
                    confirmLabel="Delete"
                    action={deleteCommentAction}
                    hiddenFields={{ commentId: comment.id }}
                    successToast="Comment deleted"
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-faint py-8 text-center">
                  No comments match.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Panel>
      {rows.length > 0 ? (
        <div className="flex flex-col items-center gap-2 pb-1 pt-[18px]">
          {rows.length < total ? (
            <Button asChild size="xs" variant="outline-strong" className="px-[22px] py-[9px]">
              <a href={moreHref}>Load more</a>
            </Button>
          ) : null}
          <span className="font-mono text-faint text-[11px] tabular-nums">
            Showing {rows.length.toLocaleString()} of {total.toLocaleString()}
          </span>
        </div>
      ) : null}
    </BulkSelect>
  );
}
