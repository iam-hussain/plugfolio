import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { NotFoundError, getCollabThread } from "@plugfolio/core";
import { CollabThreadView } from "@/features/business-collab";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";

/**
 * One collab thread — where the bargain actually happens (§5.24, brief 12).
 *
 * ONE SCREEN, TWO ROLES. The viewer's side comes back from the service and
 * drives the back link, the attribution and which bubbles sit right.
 * Building a business version and a creator version would be two screens
 * that have to agree about one conversation forever.
 *
 * THE PIN IS THE POINT. A negotiation held only in messages leaves both
 * sides scrolling to find what was agreed and disagreeing later, so the
 * live terms sit pinned at the top and a new proposal clears BOTH
 * acceptances. "Agreed" can then only mean agreed to the terms shown.
 *
 * v1 handles no money: price is free text, the thread's job ends at agreed
 * terms, and the banner says payment settles off Plugfolio rather than
 * implying an escrow that does not exist.
 *
 * Non-participants get notFound(), never a permission error — confirming a
 * thread exists is itself the leak.
 */
type Params = { collabId: string };

export const metadata: Metadata = { title: "Collab" };

export default async function CollabThreadPage({ params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const { collabId } = await params;
  let result: Awaited<ReturnType<typeof getCollabThread>>;
  try {
    result = await getCollabThread(businessCollabDeps, session.user.id, collabId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const { thread, side } = result;

  return <CollabThreadView thread={thread} side={side} />;
}
