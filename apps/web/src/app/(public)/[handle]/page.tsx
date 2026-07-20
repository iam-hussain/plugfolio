import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCreatorPage } from "@plugfolio/core";
import { CreatorHeader, PostGrid } from "@/features/creator-page";
import { repositories } from "@/server/container";

// The no-login shopper surface (ADR-0002). Server Component for fast, indexable
// pages that behave inside in-app browsers (§5, ADR-0001). RSC calls the read
// service directly — no HTTP hop (§6.11).
type Params = { handle: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default async function CreatorPage({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  const page = await getCreatorPage({ creatorPages: repositories.creatorPages }, handle);
  if (!page) notFound();

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <CreatorHeader handle={page.username} />
      <PostGrid handle={page.username} posts={page.posts} />
    </main>
  );
}
