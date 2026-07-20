import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getComments, getCreatorPage, isFollowingProfile } from "@plugfolio/core";
import { CreatorHeader, PostGrid } from "@/features/creator-page";
import { CommentForm, CommentList, FollowButton } from "@/features/shopper-account";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The no-login shopper surface (ADR-0002). Server Component for fast, indexable
// pages that behave inside in-app browsers (§5, ADR-0001). RSC calls the read
// services directly — no HTTP hop (§6.11). A session, if present, only enriches
// (follow state, comment box) — nothing here ever requires one (§2.2).
type Params = { handle: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default async function CreatorPage({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  const page = await getCreatorPage({ creatorPages: repositories.creatorPages }, handle);
  if (!page) notFound();

  const session = await auth();
  const [following, comments] = await Promise.all([
    session?.user
      ? isFollowingProfile({ follows: repositories.follows }, session.user.id, page.id)
      : Promise.resolve(false),
    getComments({ comments: repositories.comments }, page.id),
  ]);

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <CreatorHeader handle={page.username} />
      <div className="flex justify-center pb-6">
        <FollowButton
          profileId={page.id}
          isAuthenticated={!!session?.user}
          initiallyFollowing={following}
        />
      </div>
      <PostGrid handle={page.username} posts={page.posts} />
      <section aria-label="Comments" className="pt-8">
        <h2 className="pb-3 font-medium">Comments</h2>
        <CommentList comments={comments} />
        <div className="pt-4">
          {session?.user ? (
            <CommentForm profileId={page.id} />
          ) : (
            <p className="text-muted-foreground text-sm">
              <Link href="/api/auth/signin" className="underline">
                Sign in
              </Link>{" "}
              to comment — shopping never needs an account.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
