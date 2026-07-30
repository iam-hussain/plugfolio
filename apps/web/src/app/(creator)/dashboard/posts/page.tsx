import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCreatorPage, getMyProfiles } from "@plugfolio/core";
import {
  DashBody,
  EmptyState,
  FilterButton,
  Filters,
  IconAction,
  Pill,
  PostRow,
  PostRowActions,
  PostRowCount,
  PostRowLink,
  PostRows,
} from "@plugfolio/ui";
import { Pencil, ShoppingBag } from "lucide-react";
import {
  AddPostDialog,
  DashboardPageHeader,
  PostVisibilitySwitch,
} from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Posts tab (DESIGN dashboard.html §5.19). A list, not a grid: the grid showed
// the photograph, which the creator already recognises. What they open this tab
// to check is in words — is it on the page, which shelf, how many products —
// and words want rows.
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
  const categoryById = new Map((page?.categories ?? []).map((c) => [c.id, c.title]));
  const filter = FILTERS.some((option) => option.key === params.filter) ? params.filter : "all";
  const filtered = posts.filter((post) =>
    filter === "tagged"
      ? post.products.length > 0
      : filter === "untagged"
        ? post.products.length === 0
        : true,
  );

  return (
    <>
      <DashboardPageHeader
        title="Posts"
        eyebrow={`@${active.username}`}
        action={<AddPostDialog profileId={active.id} />}
      />

      <DashBody>
        <Filters>
          {FILTERS.map(({ key, label }) => (
            <FilterButton key={key} current={filter === key} asChild>
              <Link
                href={{ pathname: "/dashboard/posts", query: { profile: active.id, filter: key } }}
              >
                {label}
              </Link>
            </FilterButton>
          ))}
        </Filters>

        {filtered.length === 0 ? (
          <EmptyState title={posts.length === 0 ? "No posts yet" : "Nothing here"}>
            {posts.length === 0
              ? "Add your first post — then tag products onto it to make it shoppable."
              : "No posts match this filter."}
          </EmptyState>
        ) : (
          <PostRows>
            {filtered.map((post) => {
              const shelf = post.categoryId ? categoryById.get(post.categoryId) : null;
              return (
                <PostRow key={post.id} hidden={Boolean(post.hiddenAt)}>
                  <PostRowLink
                    asChild
                    thumbnail={
                      <span className="bg-active rounded-image relative size-[54px] flex-none overflow-hidden">
                        <Image
                          src={post.mediaUrl}
                          alt=""
                          fill
                          unoptimized
                          sizes="54px"
                          className="object-cover"
                        />
                      </span>
                    }
                    title={post.caption ?? "Untitled post"}
                    meta={
                      <>
                        {shelf ? <Pill tone="shelf">{shelf}</Pill> : null}
                        {post.products.length > 0 ? (
                          <PostRowCount>
                            <ShoppingBag aria-hidden />
                            {post.products.length}{" "}
                            {post.products.length === 1 ? "product" : "products"}
                          </PostRowCount>
                        ) : (
                          // Untagged is the state that needs the work, so it is
                          // the one that carries colour.
                          <Pill tone="untagged">Untagged</Pill>
                        )}
                      </>
                    }
                  >
                    <Link href={`/dashboard/posts/${post.id}?profile=${active.id}`} />
                  </PostRowLink>

                  <PostRowActions>
                    <PostVisibilitySwitch
                      profileId={active.id}
                      postId={post.id}
                      hidden={Boolean(post.hiddenAt)}
                    />
                    <IconAction label="Edit this post" asChild>
                      <Link href={`/dashboard/posts/${post.id}?profile=${active.id}`}>
                        <Pencil aria-hidden />
                      </Link>
                    </IconAction>
                  </PostRowActions>
                </PostRow>
              );
            })}
          </PostRows>
        )}
      </DashBody>
    </>
  );
}
