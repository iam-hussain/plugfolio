import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getMyProfiles, getShopperPost, listMyCategories } from "@plugfolio/core";
import { CategorySelect, TagProductForm } from "@/features/product-tagging";
import { formatPrice } from "@/lib/format-price";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The tagging editor (lean journey: "Open a post, paste any product URL…").
export const metadata: Metadata = { title: "Tag products" };

type Params = { postId: string };
type SearchParams = { profile?: string };

export default async function TagPostPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, (await searchParams).profile);
  if (!active) redirect("/dashboard");

  const { postId } = await params;
  // Scoped by the creator's own username — another profile's post is a 404.
  const [post, categories] = await Promise.all([
    getShopperPost({ creatorPages: repositories.creatorPages }, active.username, postId),
    listMyCategories(
      { profiles: repositories.profiles, categories: repositories.categories },
      session.user.id,
      active.id,
    ),
  ]);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <nav className="py-4">
        <Link href={`/dashboard/posts?profile=${active.id}`} className="text-muted-foreground text-sm">
          ← Posts
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
      <div className="py-2">
        <CategorySelect
          target={{ kind: "post", postId: post.id, profileId: active.id }}
          categories={categories}
          currentCategoryId={post.categoryId}
        />
      </div>

      <section aria-label="Tagged products" className="py-4">
        <h2 className="pb-3 font-medium">Tagged products</h2>
        {post.products.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing tagged yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {post.products.map((product) => (
              <li key={product.id} className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate">{product.title}</span>
                <span className="text-muted-foreground shrink-0">
                  {formatPrice(product.priceCents, product.currency) ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Tag a product">
        <h2 className="pb-3 font-medium">Tag a product</h2>
        <TagProductForm profileId={active.id} postId={post.id} />
      </section>
    </main>
  );
}
