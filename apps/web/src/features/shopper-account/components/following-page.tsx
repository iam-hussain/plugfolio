import type { FollowSort, FollowedCreator } from "@plugfolio/core";
import { Button, cn, EmptyState, LastLooked, measure } from "@plugfolio/ui";
import Link from "next/link";
import { sinceLabel } from "../follow-labels";
import { FollowingControls } from "./following-controls";
import { FollowingList } from "./following-list";

/**
 * /following — the followed-creators list (design following.html).
 *
 * The spec line this walks and does not cross: v1 has no aggregated "My
 * Creators" feed, so nothing here merges anyone's posts into a stream you
 * scroll and buy from. What it adds is per-creator metadata — "3 new since you
 * last looked" — which is a fact about a row, not a feed. Every route out goes
 * to that creator's own page, which is where buying happens.
 *
 * No explainer: someone signed in, on a page called Following, reached from a
 * tab called Following, already knows what this is. The one line that stays is
 * the one carrying information they don't have — when they last looked, which
 * is the denominator for every count below it.
 *
 * Presentational: the route reads, this composes. This file holds the shell and
 * the two empty states — the groups are `FollowingList`, the wording is this
 * feature's `follow-labels`.
 */
export type FollowingPageProps = {
  rows: readonly FollowedCreator[];
  /** The account's PREVIOUS visit; null = it has never opened this page. */
  since: Date | null;
  /** Rendered on the server so "6 days ago" can't drift between server and client. */
  now: Date;
  search: string;
  sort: FollowSort;
  page: number;
  total: number;
  /** Follows before the search narrowed them — tells "none" from "no match". */
  followedTotal: number;
  hasMore: boolean;
  pageSize: number;
};

export function FollowingPage({
  rows,
  since,
  now,
  search,
  sort,
  page,
  total,
  followedTotal,
  hasMore,
  pageSize,
}: FollowingPageProps) {
  return (
    <main className={cn(measure(), "pb-[clamp(48px,7vw,88px)] pt-[clamp(20px,3vw,34px)]")}>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-display text-display font-bold leading-[1.08] tracking-[-0.04em]">
          Following
        </h1>
        {followedTotal > 0 && since ? <LastLooked>{sinceLabel(since, now)}</LastLooked> : null}
      </div>
      <p className="text-muted-foreground text-copy mt-2 max-w-[460px] leading-[1.55]">
        A list, not a feed. Every route out of here goes to that creator&apos;s own page — nothing
        is merged into a stream you buy from.
      </p>

      {followedTotal === 0 ? (
        <div className="mt-[26px]">
          <EmptyState
            title="You aren't following anyone yet."
            action={
              <Button asChild>
                <Link href="/explore">Find creators</Link>
              </Button>
            }
          >
            Following saves a creator here so you can find them again. It&apos;s the only thing an
            account is for — buying never needs one.
          </EmptyState>
        </div>
      ) : (
        <>
          <FollowingControls search={search} sort={sort} />

          {total === 0 ? (
            // "No match" is a different answer from "none", and the follow list
            // is a smaller haystack than Explore — say so rather than implying
            // the person doesn't exist.
            <div className="mt-[26px]">
              <EmptyState
                title="Nobody you follow matches that."
                action={
                  <Button variant="secondary" asChild>
                    <Link href="/explore">Search everyone instead</Link>
                  </Button>
                }
              >
                This searches only the people you already follow — not everyone on Plugfolio.
              </EmptyState>
            </div>
          ) : (
            <FollowingList
              rows={rows}
              now={now}
              search={search}
              sort={sort}
              page={page}
              total={total}
              hasMore={hasMore}
              pageSize={pageSize}
            />
          )}
        </>
      )}
    </main>
  );
}
