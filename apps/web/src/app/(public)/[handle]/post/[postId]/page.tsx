import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getShopperPost } from "@plugfolio/core";
import { TaggedProductCard } from "@/features/creator-page";
import { repositories } from "@/server/container";

// Post view (brief 02): the post opens with its tagged products right there —
// "this is what's in the video." Still the no-login surface (ADR-0002).
type Params = { handle: string; postId: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle } = await params;
  return { title: `Post · @${handle}` };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { handle, postId } = await params;
  const post = await getShopperPost({ creatorPages: repositories.creatorPages }, handle, postId);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <nav className="py-4">
        <Link href={`/${handle}`} className="text-muted-foreground text-sm">
          ← @{handle}
        </Link>
      </nav>
      <div className="bg-muted relative aspect-square overflow-hidden rounded-md">
        <Image
          src={post.mediaUrl}
          alt={post.caption ?? "Post"}
          fill
          unoptimized
          className="object-cover"
          priority
        />
      </div>
      {post.caption ? <p className="py-3 text-sm">{post.caption}</p> : null}
      <section aria-label="Tagged products" className="flex flex-col gap-2 pt-2">
        {post.products.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No products tagged on this post.
          </p>
        ) : (
          post.products.map((product) => (
            <TaggedProductCard key={product.id} handle={handle} postId={post.id} product={product} />
          ))
        )}
      </section>
    </main>
  );
}
