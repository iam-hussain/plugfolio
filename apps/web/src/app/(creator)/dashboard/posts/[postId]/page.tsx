import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getMyProfiles, getShopperPost, listMyCategories } from "@plugfolio/core";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@plugfolio/ui";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  CategorySelect,
  DashboardShell,
  ProductRow,
  TagProductForm,
} from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The tagging editor (brief 07): a focused workspace — the post, what's
// tagged on it, and the paste-a-URL form. Publish-free: tags go live as
// they're added.
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
    <DashboardShell profiles={profiles} active={active}>
      <nav className="flex items-center justify-between pb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/posts?profile=${active.id}`}>
            <ArrowLeft className="size-4" />
            Posts
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${active.username}/post/${post.id}`}>
            <ExternalLink className="size-4" />
            View as visitor
          </Link>
        </Button>
      </nav>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
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
        </div>

        <div className="flex flex-col gap-6">
          <section aria-label="Tagged products">
            <h2 className="pb-3 font-medium">
              Tagged products
              {post.products.length > 0 ? (
                <span className="text-muted-foreground"> · {post.products.length}</span>
              ) : null}
            </h2>
            {post.products.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nothing tagged yet — paste a product URL below and this post becomes shoppable.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {post.products.map((product) => (
                  <li key={product.id}>
                    <ProductRow product={product} categories={categories} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Tag a product</CardTitle>
            </CardHeader>
            <CardContent>
              <TagProductForm profileId={active.id} postId={post.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
