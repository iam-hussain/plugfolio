import Link from "next/link";
import type { AccessibleProfile, CollabSummary, RequirementView } from "@plugfolio/core";
import {
  Avatar,
  AvatarFallback,
  Button,
  CollabRow,
  CollabRows,
  DashBody,
  DashCard,
  EmptyState,
  FilterButton,
  Filters,
  IconAction,
  Pill,
} from "@plugfolio/ui";
import { Eye } from "lucide-react";
import { DashboardPageHeader } from "@/features/product-tagging";
import { relativeTime } from "@/lib/format-date";
import { RequirementBoard } from "./requirement-board";

/** A creator collab row with its derived "needs a reply" flag. */
export type CreatorCollabRow = CollabSummary & { needsReply: boolean };

/**
 * The creator's Collabs tab (DESIGN dashboard.html §5.24): the LIST, not the
 * thread — so a creator can see at a glance who is waiting on them.
 *
 * The route above it loads and nothing else (§5: `app/` is thin).
 */
export type CreatorCollabsViewProps = {
  active: AccessibleProfile | null;
  /** Every collab, with its needs-reply flag — drives counts and the All tab. */
  rows: readonly CreatorCollabRow[];
  /** The collabs under the active filter. */
  filtered: readonly CreatorCollabRow[];
  filter: "all" | "new" | "agreed";
  needsReplyCount: number;
  requirements: readonly RequirementView[];
};

/** The tab links carry the active profile forward, or nothing when there's none. */
function profileQuery(profileId?: string) {
  return profileId ? { profile: profileId } : {};
}

export function CreatorCollabsView({
  active,
  rows,
  filtered,
  filter,
  needsReplyCount,
  requirements,
}: CreatorCollabsViewProps) {
  return (
    <>
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

        <p className="text-faint text-pico tracking-eyebrow mb-2.5 font-mono font-bold uppercase">
          Incoming requests
        </p>
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
                    <AvatarFallback className="text-primary font-bold">
                      {collab.businessName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                }
                name={collab.businessName}
                status={
                  collab.needsReply ? (
                    <Pill tone="new">Awaiting you</Pill>
                  ) : collab.agreed ? (
                    <Pill tone="agreed">Terms agreed</Pill>
                  ) : null
                }
                summary={collab.requirementTitle ?? "Direct request"}
                meta={
                  <>
                    {collab.requirementTitle ? "From the brief board" : "Direct request"} ·{" "}
                    {relativeTime(collab.createdAt)}
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

        <p className="text-faint text-pico tracking-eyebrow mb-2.5 mt-6 font-mono font-bold uppercase">
          Open requirements
        </p>
        <DashCard className="mt-0">
          {active ? (
            <RequirementBoard requirements={requirements} approachAsProfileId={active.id} />
          ) : (
            <p className="text-muted-foreground text-copy">
              Create a profile to approach requirements.
            </p>
          )}
        </DashCard>
      </DashBody>
    </>
  );
}
