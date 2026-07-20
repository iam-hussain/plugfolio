import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getMyProfiles,
  listMyCreatorCollabs,
  listOpenRequirements,
} from "@plugfolio/core";
import { CollabList, RequirementBoard } from "@/features/business-collab";
import { auth } from "@/server/auth";
import { businessCollabDeps, repositories } from "@/server/container";

// The creator's Collabs tab (lean journey): two lists in one place — open
// requirements to approach, and the threads you're in.
export const metadata: Metadata = { title: "Collabs" };

export default async function CreatorCollabsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const [profiles, requirements, collabs] = await Promise.all([
    getMyProfiles({ profiles: repositories.profiles }, session.user.id),
    listOpenRequirements(businessCollabDeps),
    listMyCreatorCollabs(businessCollabDeps, session.user.id),
  ]);
  // ponytail: first profile only, same as the dashboard — switcher comes with
  // multi-profile creation.
  const active = profiles[0];

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <nav className="py-4">
        <Link href="/dashboard" className="text-muted-foreground text-sm">
          ← Dashboard
        </Link>
      </nav>
      <header className="pb-6">
        <h1 className="font-display text-2xl font-semibold">Collabs</h1>
      </header>
      <section aria-label="Your threads" className="pb-8">
        <h2 className="pb-3 font-medium">Your threads</h2>
        <CollabList collabs={collabs} show="business" />
      </section>
      <section aria-label="Open requirements">
        <h2 className="pb-3 font-medium">Open requirements</h2>
        {active ? (
          <RequirementBoard requirements={requirements} approachAsProfileId={active.id} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Create a profile to approach requirements.
          </p>
        )}
      </section>
    </main>
  );
}
