import { searchPosts } from "@plugfolio/core";
import {
  Button,
  ConfirmDialog,
  PageHeader,
  Pager,
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
import { pagedHref, pageQuery, type ListParams } from "@/lib/list-params";
import { repositories } from "@/server/container";
import { bulkDeletePostsAction, deletePostAction } from "./actions";

export const metadata: Metadata = { title: "Posts" };
export const dynamic = "force-dynamic";

export default async function PostsPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const params = await searchParams;
  const page = pageQuery(params);
  const { rows, total } = await searchPosts({ content: repositories.content }, params.q, page);

  return (
    <BulkSelect>
      <PageHeader title="Posts">
        <form className="flex flex-wrap items-center gap-2">
          <SearchField
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search caption / profile"
            className="w-[260px]"
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Search
          </Button>
          <Button asChild size="xs" variant="ghost-muted">
            <a href={`/posts/export${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`}>
              <Download aria-hidden className="size-[15px]" /> Export CSV
            </a>
          </Button>
        </form>
      </PageHeader>

      <BulkBar
        verb="Remove"
        title={(n) => `Remove ${n} posts?`}
        body="The action applies to every selected row. This cannot be undone. Recorded in the audit log."
        confirmLabel={(n) => `Remove ${n}`}
        action={bulkDeletePostsAction}
        successToast={(n) => `Removed ${n} posts`}
      />

      <Panel className="overflow-hidden">
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[34px]">
                <BulkAllCheckbox ids={rows.map((r) => r.id)} />
              </TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>When</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="w-[34px]">
                  <BulkCheckbox id={post.id} label={`Select post ${post.caption ?? post.id}`} />
                </TableCell>
                <TableCell className="max-w-[420px]">
                  <span className="block truncate font-medium">
                    {post.caption ?? "(no caption)"}
                  </span>
                  <a
                    href={post.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-primary text-[11px]"
                  >
                    View media ↗
                  </a>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground text-xs">
                  /{post.username}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {post.productCount}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {post.createdAt.toISOString().slice(0, 10)}
                </TableCell>
                <TableCell className="text-right">
                  <ConfirmDialog
                    trigger={<Button size="xs" variant="destructive-outline">Remove</Button>}
                    title="Remove this post?"
                    body="The post and its media come off Plugfolio. Tagged products stay live and recorded taps survive. This cannot be undone. Recorded in the audit log."
                    confirmLabel="Remove post"
                    action={deletePostAction}
                    hiddenFields={{ postId: post.id }}
                    successToast="Post removed"
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-faint py-8 text-center">
                  No posts match.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Panel>
      <Pager page={page.page} pageSize={page.pageSize} total={total} hrefFor={pagedHref("/posts", params)} />
    </BulkSelect>
  );
}
