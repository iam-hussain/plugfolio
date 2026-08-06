import type { FollowedCreator, FollowSort } from "@plugfolio/core";
import { Button, FollowGroup } from "@plugfolio/ui";
import Link from "next/link";
import { badgeFor, metaLine, plural } from "../follow-labels";
import { FollowRow } from "./follow-row";

/**
 * The two groups and the page turn.
 *
 * Split in two because the split is the *point*: "new since you last looked"
 * is the answer to "who should I look at", and putting it in its own group is
 * how the page gives that answer without becoming a feed. Nothing here merges
 * anyone's posts into a stream — every route out goes to a creator's own page.
 */
export type FollowingListProps = {
  rows: readonly FollowedCreator[];
  now: Date;
  search: string;
  sort: FollowSort;
  page: number;
  total: number;
  hasMore: boolean;
  pageSize: number;
};

export function FollowingList({
  rows,
  now,
  search,
  sort,
  page,
  total,
  hasMore,
  pageSize,
}: FollowingListProps) {
  const fresh = rows.filter((creator) => creator.newPostCount > 0);
  const rest = rows.filter((creator) => creator.newPostCount === 0);
  const shown = (page - 1) * pageSize + rows.length;

  const row = (creator: FollowedCreator) => (
    <FollowRow
      key={creator.id}
      creator={creator}
      meta={metaLine(creator, now)}
      badge={badgeFor(creator, now)}
    />
  );

  return (
    <div id="list">
      {/* No "you're all caught up" panel when nothing is new. It said nothing
          the list beneath it wasn't already saying — the group is titled
          "Everyone you follow" precisely because there is no new group, and
          every row carries its own "Nothing new" badge. A block of chrome
          announcing an absence is worse than the absence. */}
      {fresh.length > 0 ? (
        <FollowGroup title="New since you last looked" count={plural(fresh.length, "creator")}>
          {fresh.map(row)}
        </FollowGroup>
      ) : null}

      {rest.length > 0 ? (
        <FollowGroup
          title={fresh.length > 0 ? "Everyone else" : "Everyone you follow"}
          count={plural(rest.length, "creator")}
        >
          {rest.map(row)}
        </FollowGroup>
      ) : null}

      {hasMore ? (
        <div className="grid justify-items-center gap-2.5 pt-[clamp(26px,3vw,36px)] text-center">
          <Button variant="secondary" asChild className="min-w-[220px]">
            <Link
              rel="next"
              href={{
                pathname: "/following",
                query: { ...(search ? { q: search } : {}), sort, page: page + 1 },
              }}
            >
              Load {Math.min(pageSize, total - shown)} more
            </Link>
          </Button>
          <p className="text-muted-foreground text-micro font-semibold">
            Showing {shown} of {total} · search to narrow instead
          </p>
        </div>
      ) : null}
    </div>
  );
}
