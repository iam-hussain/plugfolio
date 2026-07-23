import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getMyProfiles,
  listMyCreatorCollabs,
  listOpenRequirements,
} from "@plugfolio/core";
import { CollabList, RequirementBoard } from "@/features/business-collab";
import { DashboardPageHeader, DashboardShell } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { businessCollabDeps, repositories } from "@/server/container";

// The creator's Collabs tab (lean journey): two lists in one place — open
// requirements to approach, and the threads you're in.
export const metadata: Metadata = { title: "Collabs" };

type SearchParams = { profile?: string };

export default async function CreatorCollabsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const [profiles, requirements, collabs] = await Promise.all([
    getMyProfiles({ profiles: repositories.profiles }, session.user.id),
    listOpenRequirements(businessCollabDeps),
    listMyCreatorCollabs(businessCollabDeps, session.user.id),
  ]);
  const active = pickActiveProfile(profiles, (await searchParams).profile);

  return (
    <DashboardShell profiles={profiles} active={active}>
      <DashboardPageHeader title="Collabs" eyebrow={active ? `@${active.username}` : undefined} />
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
    </DashboardShell>
  );
}
