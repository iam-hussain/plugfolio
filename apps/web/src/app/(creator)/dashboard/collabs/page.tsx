import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyProfiles, listMyCreatorCollabs, listOpenRequirements } from "@plugfolio/core";
import { CreatorCollabsView } from "@/features/business-collab";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { businessCollabDeps, repositories } from "@/server/container";

// The creator's Collabs tab (DESIGN dashboard.html §5.24): the LIST, not the
// thread — so a creator can see at a glance who is waiting on them.
//
// Payment is never here, because it never happens here: it settles
// off-platform (§2.3), and this surface says so rather than implying an escrow.
export const metadata: Metadata = { title: "Collabs" };

type SearchParams = { profile?: string; s?: string };

export default async function CreatorCollabsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  const userId = session.user.id;

  const [profiles, requirements, collabs] = await Promise.all([
    getMyProfiles({ profiles: repositories.profiles }, userId),
    listOpenRequirements(businessCollabDeps),
    listMyCreatorCollabs(businessCollabDeps, userId),
  ]);
  const params = await searchParams;
  const active = pickActiveProfile(profiles, params.profile);

  // "Needs a reply" is the other side having spoken last on an unagreed
  // thread — a real fact about the thread, not a status somebody has to set.
  const rows = collabs.map((collab) => ({
    ...collab,
    needsReply:
      !collab.agreed &&
      collab.lastMessageFromUserId !== null &&
      collab.lastMessageFromUserId !== userId,
  }));
  const filter = params.s === "new" || params.s === "agreed" ? params.s : "all";
  const filtered = rows.filter((row) =>
    filter === "new" ? row.needsReply : filter === "agreed" ? row.agreed : true,
  );
  const needsReplyCount = rows.filter((row) => row.needsReply).length;

  return (
    <CreatorCollabsView
      active={active ?? null}
      rows={rows}
      filtered={filtered}
      filter={filter}
      needsReplyCount={needsReplyCount}
      requirements={requirements}
    />
  );
}
