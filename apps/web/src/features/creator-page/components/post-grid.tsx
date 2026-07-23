import type { ShopperPost } from "@plugfolio/core";
import Image from "next/image";
import Link from "next/link";

/**
 * The creator page's content grid (design-out creator feed, grid layout):
 * 3-column rounded tiles; posts with tagged products carry the ink
 * product-count pill so shoppers know where to tap. Each tile opens the post
 * view. Presentational; renders on the server.
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
    <ul className="mt-4 grid grid-cols-3 gap-2">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/${handle}/post/${post.id}`}
            className="bg-muted relative block aspect-square overflow-hidden rounded-[10px]"
          >
            {/* ponytail: unoptimized until the social-import pipeline pins image domains for next/image remotePatterns */}
            <Image
              src={post.mediaUrl}
              alt={post.caption ?? "Post"}
              fill
              unoptimized
              className="object-cover"
            />
            {post.products.length > 0 ? (
              <span className="bg-brand-ink/60 rounded-pill absolute bottom-[7px] left-[7px] px-2 py-[3px] font-mono text-[9px] font-bold text-white">
                {post.products.length} {post.products.length === 1 ? "product" : "products"}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
