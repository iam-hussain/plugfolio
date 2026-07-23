import { searchPosts } from "@plugfolio/core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import type { Metadata } from "next";
import { ConfirmButton } from "@/components/confirm-button";
import { SearchHeader } from "@/components/search-header";
import { repositories } from "@/server/container";
import { deletePostAction } from "./actions";

export const metadata: Metadata = { title: "Posts" };
export const dynamic = "force-dynamic";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const posts = await searchPosts({ content: repositories.content }, q);

  return (
    <div className="flex flex-col gap-6">
      <SearchHeader title="Posts" query={q} placeholder="Search caption, profile…" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Post</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>When</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="max-w-md">
                <p className="truncate text-sm">{post.caption ?? "(no caption)"}</p>
                <a
                  href={post.mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-xs underline"
                >
                  View media
                </a>
              </TableCell>
              <TableCell className="font-mono text-xs">/{post.username}</TableCell>
              <TableCell className="text-muted-foreground text-xs tabular-nums">
                {post.productCount}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs tabular-nums">
                {post.createdAt.toISOString().slice(0, 10)}
              </TableCell>
              <TableCell className="text-right">
                <form action={deletePostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <ConfirmButton
                    size="sm"
                    variant="destructive"
                    message="Remove this post? Its tagged products stay; recorded taps survive. This can't be undone."
                  >
                    Remove
                  </ConfirmButton>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                No posts match.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
