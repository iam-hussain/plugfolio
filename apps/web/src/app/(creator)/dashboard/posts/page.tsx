import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCreatorPage, getMyProfiles } from "@plugfolio/core";
import { NewPostForm } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Posts tab (lean journey): every post, tap one to tag its products — the
// core tool. Manual posts are the interim source until social import lands.
export const metadata: Metadata = { title: "Posts" };

type SearchParams = { profile?: string };

export default async function DashboardPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, (await searchParams).profile);
  if (!active) redirect("/dashboard");

  const page = await getCreatorPage({ creatorPages: repositories.creatorPages }, active.username);
  const posts = page?.posts ?? [];

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <nav className="py-4">
        <Link href="/dashboard" className="text-muted-foreground text-sm">
          ← Dashboard
        </Link>
      </nav>
      <header className="pb-6">
        <h1 className="font-display text-2xl font-semibold">
          Posts · <span className="text-muted-foreground">@{active.username}</span>
        </h1>
      </header>
      <section aria-label="Your posts" className="pb-8">
        {posts.length === 0 ? (
          <p className="text-muted-foreground pb-4 text-sm">No posts yet — add your first below.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/dashboard/posts/${post.id}?profile=${active.id}`}
                  className="flex items-center gap-3"
                >
                  <span className="bg-muted relative block h-14 w-14 shrink-0 overflow-hidden rounded-sm">
                    <Image
                      src={post.mediaUrl}
                      alt={post.caption ?? "Post"}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {post.caption ?? "Untitled post"}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {post.products.length} tagged
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-label="Add a post">
        <h2 className="pb-3 font-medium">Add a post</h2>
        <NewPostForm profileId={active.id} />
      </section>
    </main>
  );
}
