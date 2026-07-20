import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { NotFoundError, getCollabThread } from "@plugfolio/core";
import { ThreadActions } from "@/features/business-collab";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";

// One collab thread — the bargain happens here (content + price), for both
// sides. Participants only; outsiders get a 404, not a hint it exists.
type Params = { collabId: string };

export const metadata: Metadata = { title: "Collab" };

export default async function CollabThreadPage({ params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { collabId } = await params;
  let result: Awaited<ReturnType<typeof getCollabThread>>;
  try {
    result = await getCollabThread(businessCollabDeps, session.user.id, collabId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const { thread, side } = result;

  const agreed = thread.businessAgreedAt !== null && thread.creatorAgreedAt !== null;
  const mine = side === "business" ? thread.businessAgreedAt : thread.creatorAgreedAt;
  const theirs = side === "business" ? thread.creatorAgreedAt : thread.businessAgreedAt;

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <nav className="py-4">
        <Link
          href={side === "business" ? "/collabs" : "/dashboard/collabs"}
          className="text-muted-foreground text-sm"
        >
          ← Collabs
        </Link>
      </nav>
      <header className="pb-6">
        <h1 className="font-display text-xl font-semibold">
          {thread.businessName} × @{thread.username}
        </h1>
        <p className="text-muted-foreground text-sm">
          {thread.requirementTitle ?? "Direct collab"}
          {agreed ? " · Agreed — payment settles off-platform" : ""}
        </p>
      </header>
      <section aria-label="Messages" className="pb-6">
        <ul className="flex flex-col gap-3">
          {thread.messages.map((message) => (
            <li key={message.id} className="text-sm">
              <span className="font-medium">
                {message.fromBusiness ? thread.businessName : `@${thread.username}`}
              </span>{" "}
              <span className="text-muted-foreground">{message.body}</span>
            </li>
          ))}
        </ul>
      </section>
      <ThreadActions collabId={thread.id} hasAgreed={mine !== null} otherSideAgreed={theirs !== null} />
    </main>
  );
}
