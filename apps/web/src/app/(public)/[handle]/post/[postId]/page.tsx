import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorPage, getShopperPost } from "@plugfolio/core";
import { CreatorHeader, TaggedProductCard } from "@/features/creator-page";
import { repositories } from "@/server/container";

// Post view (brief 02, design-out post detail): the creator header stays on
// top, then "← Back to @handle" and the two-column detail — media beside the
// caption + tagged products, "this is what's in the video." Still the
// no-login surface (ADR-0002).
type Params = { handle: string; postId: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle } = await params;
  return { title: `Post · @${handle}` };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { handle, postId } = await params;
  const deps = { creatorPages: repositories.creatorPages };
  const [page, post] = await Promise.all([
    getCreatorPage(deps, handle),
    getShopperPost(deps, handle, postId),
  ]);
  if (!page || !post) notFound();

  const productCount = post.products.length;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-14 lg:px-11">
      <CreatorHeader handle={page.username} followerCount={page.followerCount} />
      <nav className="mt-4 pb-3.5">
        <Link
          href={`/${handle}`}
          className="text-muted-foreground hover:text-foreground font-mono text-xs"
        >
          ← Back to @{handle}
        </Link>
      </nav>
      <div className="flex flex-col gap-[18px] lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-5">
        <div className="border-border bg-muted relative aspect-square overflow-hidden rounded-2xl border">
          {/* ponytail: unoptimized until the social-import pipeline pins image domains */}
          <Image
            src={post.mediaUrl}
            alt={post.caption ?? "Post"}
            fill
            unoptimized
            className="object-cover"
            priority
          />
        </div>
        <div>
          {post.caption ? (
            <h1 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">
              {post.caption}
            </h1>
          ) : null}
          <p className="bg-primary/10 text-primary mt-2.5 inline-flex items-center gap-[7px] rounded-pill px-3 py-[5px] font-mono text-[10.5px] font-bold">
            {productCount} {productCount === 1 ? "product" : "products"} tagged
          </p>
          <section aria-label="Tagged products" className="mt-4 flex flex-col gap-2.5">
            {productCount === 0 ? (
              <p className="text-muted-foreground py-6 text-sm">No products tagged on this post.</p>
            ) : (
              post.products.map((product) => (
                <TaggedProductCard
                  key={product.id}
                  handle={handle}
                  postId={post.id}
                  product={product}
                />
              ))
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
