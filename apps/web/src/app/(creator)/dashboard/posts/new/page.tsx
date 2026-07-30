import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyProfiles, listMyCategories } from "@plugfolio/core";
import {
  DashBody,
  EditorGrid,
  EmptyState,
  PageHead,
  PageHeadTitle,
} from "@plugfolio/ui";
import { ChevronLeft } from "lucide-react";
import { PostForm } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Adding a post is a page, not a dialog (DESIGN post-edit.html, mode=new). The
// dialog held a URL and a caption; the real screen also picks the media kind
// and the shelf, and leads straight into tagging — none of which fits a box
// over a list.
//
// Create and edit are the same screen. What a new post cannot do — be hidden,
// be viewed as a visitor, be tagged — is ABSENT rather than disabled: you
// cannot pin a product onto something that is not saved, and a disabled
// control is a promise about a state you have not reached.
export const metadata: Metadata = { title: "New post" };

type SearchParams = { profile?: string };

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, (await searchParams).profile);
  if (!active) redirect("/dashboard");

  const categories = await listMyCategories(
    { profiles: repositories.profiles, categories: repositories.categories },
    session.user.id,
    active.id,
  );

  return (
    <>
      <PageHead>
        <PageHeadTitle
          eyebrow={
            <Link
              href={`/dashboard/posts?profile=${active.id}` as Route}
              className="inline-flex items-center gap-1 no-underline"
            >
              <ChevronLeft className="size-3.5" aria-hidden />
              All posts
            </Link>
          }
        >
          New post
        </PageHeadTitle>
      </PageHead>

      <DashBody>
        <EditorGrid>
          <PostForm
            profileId={active.id}
            categories={categories}
          />

          {/* A single line, not a disabled form: there is nothing to pin a
              product onto until the post exists. */}
          <EmptyState title="Save the post first">
            A product connects TO a post, so the post has to exist before there is anything to
            connect it to. Add it and this side becomes the connector.
          </EmptyState>
        </EditorGrid>
      </DashBody>
    </>
  );
}
