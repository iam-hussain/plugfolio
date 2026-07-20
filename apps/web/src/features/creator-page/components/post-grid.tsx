import type { ShopperPost } from "@plugfolio/core";
import Image from "next/image";
import Link from "next/link";

/**
 * The creator page's content grid (brief 01) — each tile opens the post view.
 * Presentational; renders on the server.
 */
export type PostGridProps = {
  handle: string;
  posts: readonly ShopperPost[];
};

export function PostGrid({ handle, posts }: PostGridProps) {
  if (posts.length === 0) {
    return <p className="text-muted-foreground py-12 text-center text-sm">No posts yet.</p>;
  }

  return (
    <ul className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/${handle}/post/${post.id}`}
            className="bg-muted relative block aspect-square overflow-hidden rounded-sm"
          >
            {/* ponytail: unoptimized until the social-import pipeline pins image domains for next/image remotePatterns */}
            <Image
              src={post.mediaUrl}
              alt={post.caption ?? "Post"}
              fill
              unoptimized
              className="object-cover"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
