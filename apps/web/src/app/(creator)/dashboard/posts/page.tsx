import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCreatorPage, getMyProfiles } from "@plugfolio/core";
import { POST_FILTERS, PostsListView } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Posts tab (DESIGN dashboard.html §5.19). A list, not a grid: the grid showed
// the photograph, which the creator already recognises. What they open this tab
// to check is in words — is it on the page, which shelf, how many products —
// and words want rows.
export const metadata: Metadata = { title: "Posts" };

type SearchParams = { profile?: string; filter?: string };

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
  const categoryById = new Map((page?.categories ?? []).map((c) => [c.id, c.title]));
  const filter = POST_FILTERS.some((option) => option.key === params.filter)
    ? params.filter
    : "all";
  const filtered = posts.filter((post) =>
    filter === "tagged"
      ? post.products.length > 0
      : filter === "untagged"
        ? post.products.length === 0
        : true,
  );

  return (
    <PostsListView
      profileId={active.id}
      username={active.username}
      posts={posts}
      filtered={filtered}
      categoryById={categoryById}
      filter={filter as string}
    />
  );
}
