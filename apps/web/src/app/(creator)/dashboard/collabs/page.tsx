import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyProfiles, listMyCreatorCollabs, listOpenRequirements } from "@plugfolio/core";
import {
  Avatar,
  AvatarFallback,
  Button,
  CollabRow,
  CollabRows,
  DashBody,
  DashCard,
  DashCardHead,
  DashCardTitle,
  EmptyState,
  FilterButton,
  Filters,
  IconAction,
  Pill,
} from "@plugfolio/ui";
import { Eye } from "lucide-react";
import { RequirementBoard } from "@/features/business-collab";
import { DashboardPageHeader, DashboardShell } from "@/features/product-tagging";
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

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

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
    <DashboardShell profiles={profiles} active={active}>
      <DashboardPageHeader
        title="Collabs"
        eyebrow={active ? `@${active.username}` : undefined}
        action={
          <Button variant="outline" asChild>
            <Link href="/collabs">Open the board</Link>
          </Button>
        }
      />

      <DashBody>
        <Filters>
          <FilterButton current={filter === "all"} count={rows.length} asChild>
            <Link href={{ pathname: "/dashboard/collabs", query: profileQuery(active?.id) }}>
              All
            </Link>
          </FilterButton>
          <FilterButton
            current={filter === "new"}
            count={needsReplyCount > 0 ? needsReplyCount : undefined}
            asChild
          >
            <Link
              href={{
                pathname: "/dashboard/collabs",
                query: { ...profileQuery(active?.id), s: "new" },
              }}
            >
              Needs a reply
            </Link>
          </FilterButton>
          <FilterButton current={filter === "agreed"} asChild>
            <Link
              href={{
                pathname: "/dashboard/collabs",
                query: { ...profileQuery(active?.id), s: "agreed" },
              }}
            >
              Agreed
            </Link>
          </FilterButton>
        </Filters>

        {filtered.length === 0 ? (
          <EmptyState
            title={rows.length === 0 ? "No collabs yet" : "Nothing here"}
            action={
              rows.length === 0 ? (
                <Button asChild>
                  <Link href="/collabs">See the brief board</Link>
                </Button>
              ) : null
            }
          >
            {rows.length === 0
              ? "Brands can request you directly from your page, or you can answer briefs on the open board. Either way it becomes one thread."
              : "No thread is in that state right now."}
          </EmptyState>
        ) : (
          <CollabRows>
            {filtered.map((collab) => (
              <CollabRow
                key={collab.id}
                avatar={
                  <Avatar className="size-11 flex-none">
                    <AvatarFallback className="bg-active text-primary font-bold">
                      {collab.businessName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                }
                name={collab.businessName}
                status={
                  collab.needsReply ? (
                    <Pill tone="new">Needs a reply</Pill>
                  ) : collab.agreed ? (
                    <Pill tone="agreed">Terms agreed</Pill>
                  ) : null
                }
                summary={collab.requirementTitle ?? "Direct request"}
                meta={
                  <>
                    {collab.requirementTitle ? "From the brief board" : "Direct request"} ·{" "}
                    {ago(collab.createdAt)}
                    {collab.agreed ? " · payment settles off-platform" : ""}
                  </>
                }
                action={
                  <IconAction label={`Open the thread with ${collab.businessName}`} asChild>
                    <Link href={`/collabs/${collab.id}`}>
                      <Eye aria-hidden />
                    </Link>
                  </IconAction>
                }
              />
            ))}
          </CollabRows>
        )}

        <DashCard className="mt-3.5">
          <DashCardHead>
            <DashCardTitle>Open requirements</DashCardTitle>
          </DashCardHead>
          {active ? (
            <RequirementBoard requirements={requirements} approachAsProfileId={active.id} />
          ) : (
            <p className="text-muted-foreground text-copy">
              Create a profile to approach requirements.
            </p>
          )}
        </DashCard>
      </DashBody>
    </DashboardShell>
  );
}

function profileQuery(profileId?: string) {
  return profileId ? { profile: profileId } : {};
}

/** "2 days ago" — a thread's age matters more than its timestamp. */
function ago(date: Date): string {
  const days = Math.round((date.getTime() - Date.now()) / 86_400_000);
  if (days > -7) return relative.format(days, "day");
  if (days > -30) return relative.format(Math.round(days / 7), "week");
  return relative.format(Math.round(days / 30), "month");
}
