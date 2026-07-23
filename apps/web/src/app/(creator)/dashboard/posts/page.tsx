import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCreatorPage, getMyProfiles } from "@plugfolio/core";
import { cn, Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@plugfolio/ui";
import { ShoppingBag } from "lucide-react";
import { AddPostDialog, DashboardPageHeader, DashboardShell } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Posts tab (brief 07): every post as a thumbnail grid with a tagged /
// untagged indicator; tap one to open the tagging editor.
export const metadata: Metadata = { title: "Posts" };

type SearchParams = { profile?: string; filter?: string };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "tagged", label: "Tagged" },
  { key: "untagged", label: "Untagged" },
] as const;

export default async function DashboardPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const params = await searchParams;
  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, params.profile);
  if (!active) redirect("/dashboard");

  const page = await getCreatorPage({ creatorPages: repositories.creatorPages }, active.username);
  const posts = page?.posts ?? [];
  const filter = FILTERS.some((option) => option.key === params.filter) ? params.filter : "all";
  const filtered = posts.filter((post) =>
    filter === "tagged"
      ? post.products.length > 0
      : filter === "untagged"
        ? post.products.length === 0
        : true,
  );

  return (
    <DashboardShell profiles={profiles} active={active}>
      <DashboardPageHeader
        title="Posts"
        eyebrow={`@${active.username}`}
        action={<AddPostDialog profileId={active.id} />}
      />

      <nav aria-label="Filter posts" className="flex gap-2 pb-4">
        {FILTERS.map(({ key, label }) => (
          <Link
            key={key}
            href={{ pathname: "/dashboard/posts", query: { profile: active.id, filter: key } }}
            aria-current={filter === key ? "page" : undefined}
            className={cn(
              "rounded-pill inline-flex h-8 items-center border px-3 text-sm",
              filter === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{posts.length === 0 ? "No posts yet" : "Nothing here"}</EmptyTitle>
            <EmptyDescription>
              {posts.length === 0
                ? "Add your first post — then tag products onto it to make it shoppable."
                : "No posts match this filter."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {filtered.map((post) => (
            <li key={post.id}>
              <Link
                href={`/dashboard/posts/${post.id}?profile=${active.id}`}
                className="bg-muted relative block aspect-square overflow-hidden rounded-md"
              >
                <Image
                  src={post.mediaUrl}
                  alt={post.caption ?? "Post"}
                  fill
                  unoptimized
                  className="object-cover"
                />
                {post.products.length > 0 ? (
                  <span className="bg-background/90 text-foreground rounded-pill absolute right-1.5 bottom-1.5 inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium">
                    <ShoppingBag className="size-3" aria-hidden />
                    {post.products.length}
                    <span className="sr-only">products tagged</span>
                  </span>
                ) : (
                  <span className="bg-background/90 text-muted-foreground rounded-pill absolute right-1.5 bottom-1.5 inline-flex items-center px-2 py-0.5 text-[11px]">
                    untagged
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
