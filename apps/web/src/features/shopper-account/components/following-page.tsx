import type { FollowSort, FollowedCreator } from "@plugfolio/core";
import { Button, EmptyState, FollowGroup, LastLooked } from "@plugfolio/ui";
import Link from "next/link";
import { FollowRow } from "./follow-row";
import { FollowingControls } from "./following-controls";

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
 * Presentational: the route reads, this composes.
 */
const DAY_MS = 86_400_000;

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

function agoInDays(from: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - from.getTime()) / DAY_MS));
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/** "Last looked 6 days ago" — the denominator for every count on the page. */
function sinceLabel(since: Date, now: Date): string {
  const days = agoInDays(since, now);
  if (days === 0) return "Last looked today";
  if (days === 1) return "Last looked yesterday";
  if (days < 30) return `Last looked ${days} days ago`;
  const months = Math.floor(days / 30);
  return `Last looked ${plural(months, "month")} ago`;
}

/** "18 posts · 42 things · followed 4 months ago" */
function metaLine(creator: FollowedCreator, now: Date): string {
  const days = agoInDays(creator.followedAt, now);
  const followed =
    days < 1
      ? "today"
      : days < 30
        ? plural(days, "day") + " ago"
        : days < 365
          ? plural(Math.floor(days / 30), "month") + " ago"
          : plural(Math.floor(days / 365), "year") + " ago";
  return `${plural(creator.postCount, "post")} · ${plural(creator.productCount, "thing")} · followed ${followed}`;
}

/**
 * The badge is the point of the page: it answers "who should I look at"
 * without merging anyone's posts into a stream. Quiet rows say how long.
 */
function badgeFor(creator: FollowedCreator, now: Date): { label: string; isNew: boolean } {
  if (creator.newPostCount > 0) {
    return { label: `${plural(creator.newPostCount, "new post")}`, isNew: true };
  }
  if (!creator.lastPostAt) return { label: "No posts yet", isNew: false };
  const months = Math.floor(agoInDays(creator.lastPostAt, now) / 30);
  return { label: months >= 1 ? `Quiet ${plural(months, "month")}` : "Nothing new", isNew: false };
}

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
  const fresh = rows.filter((creator) => creator.newPostCount > 0);
  const rest = rows.filter((creator) => creator.newPostCount === 0);
  const shown = (page - 1) * pageSize + rows.length;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-[clamp(48px,7vw,88px)] pt-[clamp(20px,3vw,34px)] lg:px-11">
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-display text-[clamp(1.875rem,3.6vw,3rem)] font-bold leading-[1.08] tracking-[-0.035em]">
          Following
        </h1>
        {followedTotal > 0 && since ? (
          <LastLooked>{sinceLabel(since, now)}</LastLooked>
        ) : null}
      </div>

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
            <div id="list">
              {fresh.length > 0 ? (
                <FollowGroup title="New since you last looked" count={plural(fresh.length, "creator")}>
                  {fresh.map((creator) => (
                    <FollowRow
                      key={creator.id}
                      creator={creator}
                      meta={metaLine(creator, now)}
                      badge={badgeFor(creator, now)}
                    />
                  ))}
                </FollowGroup>
              ) : (
                // An "all caught up" line is worth more than an empty header.
                <div className="mt-[26px]">
                  <EmptyState
                    title="Nothing new since you last looked."
                    action={
                      <Button variant="secondary" asChild>
                        <Link href="/explore">Find someone new</Link>
                      </Button>
                    }
                  >
                    Everyone you follow has been quiet. Their pages are all still here.
                  </EmptyState>
                </div>
              )}

              {rest.length > 0 ? (
                <FollowGroup title={fresh.length > 0 ? "Everyone else" : "Everyone you follow"} count={plural(rest.length, "creator")}>
                  {rest.map((creator) => (
                    <FollowRow
                      key={creator.id}
                      creator={creator}
                      meta={metaLine(creator, now)}
                      badge={badgeFor(creator, now)}
                    />
                  ))}
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
                  <p className="text-muted-foreground text-xs font-semibold">
                    Showing {shown} of {total} · search to narrow instead
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </main>
  );
}

