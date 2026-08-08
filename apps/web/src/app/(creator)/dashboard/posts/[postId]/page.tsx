import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getMyProfiles,
  getShopperPost,
  getTraffic,
  listMyCategories,
  listProfileProducts,
} from "@plugfolio/core";
import { PostEditorView } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The post editor (DESIGN post-edit.html). Its own page, not a tab: tagging is
// the longest single task a creator does and the one they come back to, and
// sharing a route with the Posts list meant Back went to the dashboard rather
// than to the list — and the URL could not be sent to a Manager.
//
// Publish-free: a tag is live the moment it is added, so there is no draft
// state to explain and no Publish button to forget.
export const metadata: Metadata = { title: "Edit post" };

type Params = { postId: string };
type SearchParams = { profile?: string };

export default async function EditPostPage({
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
  const [post, categories, library, traffic] = await Promise.all([
    getShopperPost({ creatorPages: repositories.creatorPages }, active.username, postId),
    listMyCategories(
      { profiles: repositories.profiles, categories: repositories.categories },
      session.user.id,
      active.id,
    ),
    listProfileProducts({ creatorPages: repositories.creatorPages }, active.username),
    getTraffic({ traffic: repositories.traffic }, active.id),
  ]);
  if (!post) notFound();

  const measured = traffic.byPost.find((row) => row.postId === post.id);
  const taggedIds = new Set(post.products.map((product) => product.id));
  const connectable = library.filter((product) => !taggedIds.has(product.id));

  return (
    <PostEditorView
      profileId={active.id}
      username={active.username}
      post={post}
      categories={categories}
      connectable={connectable}
      measured={measured}
    />
  );
}
