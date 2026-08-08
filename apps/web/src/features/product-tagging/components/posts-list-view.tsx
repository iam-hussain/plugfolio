import Image from "next/image";
import Link from "next/link";
import type { ShopperPost } from "@plugfolio/core";
import {
  Button,
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
import { DashboardPageHeader } from "./dashboard-shell";
import { PostVisibilitySwitch } from "./hide-post-button";

/** Posts tab filters — the valid `?filter=` keys and their labels. */
export const POST_FILTERS = [
  { key: "all", label: "All" },
  { key: "tagged", label: "Tagged" },
  { key: "untagged", label: "Untagged" },
] as const;

/**
 * The creator's Posts tab (DESIGN dashboard.html §5.19) — a list, not a grid,
 * because what the creator opens this tab to check is in words.
 *
 * The route above it loads and nothing else (§5: `app/` is thin).
 */
export type PostsListViewProps = {
  profileId: string;
  username: string;
  /** Every post on the profile — for the empty-state distinction. */
  posts: readonly ShopperPost[];
  /** The posts under the active filter. */
  filtered: readonly ShopperPost[];
  /** Category id → shelf title, for the row's shelf pill. */
  categoryById: Map<string, string>;
  /** The active filter key. */
  filter: string;
};

export function PostsListView({
  profileId,
  username,
  posts,
  filtered,
  categoryById,
  filter,
}: PostsListViewProps) {
  return (
    <>
      <DashboardPageHeader
        title="Posts"
        eyebrow={`@${username}`}
        action={
          <Button asChild>
            <Link href={{ pathname: "/dashboard/posts/new", query: { profile: profileId } }}>
              Add post
            </Link>
          </Button>
        }
      />

      <DashBody>
        <Filters>
          {POST_FILTERS.map(({ key, label }) => (
            <FilterButton key={key} current={filter === key} asChild>
              <Link
                href={{ pathname: "/dashboard/posts", query: { profile: profileId, filter: key } }}
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
                    <Link href={`/dashboard/posts/${post.id}?profile=${profileId}`} />
                  </PostRowLink>

                  <PostRowActions>
                    <PostVisibilitySwitch
                      profileId={profileId}
                      postId={post.id}
                      hidden={Boolean(post.hiddenAt)}
                    />
                    <IconAction label="Edit this post" asChild>
                      <Link href={`/dashboard/posts/${post.id}?profile=${profileId}`}>
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
