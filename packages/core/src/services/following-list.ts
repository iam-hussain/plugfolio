import type { FollowRepository, FollowedCreator } from "../ports/follow-repository";
import type { FollowingQuery, FollowSort } from "../schemas/following";

/**
 * The /following read model (design following.html).
 *
 * The spec line this walks and does not cross: v1 has no aggregated "My
 * Creators" feed, so nothing here merges anyone's posts into a stream. What it
 * adds is per-creator metadata — "3 new since you last looked" — which is a
 * fact about a row, not a feed. Every route out goes to that creator's page.
 *
 * Search, sort and paging run here rather than in SQL: the repository hands
 * back the whole (hundreds-long) list, and these are pure functions over it —
 * cheap at this scale and testable without a database.
 */

export const FOLLOWING_PAGE_SIZE = 20;

export type FollowingListDeps = {
  follows: FollowRepository;
  now: () => Date;
};

export type FollowingList = {
  /** When this account last opened the page; null = never (all is new). */
  readonly since: Date | null;
  /** The rows on this page, already sorted. */
  readonly rows: readonly FollowedCreator[];
  /** Matches across every page — the denominator for "Showing X of Y". */
  readonly total: number;
  /** Follows before the search narrowed them; distinguishes "none" from "no match". */
  readonly followedTotal: number;
  readonly page: number;
  readonly hasMore: boolean;
};

function matches(creator: FollowedCreator, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return (
    creator.username.toLowerCase().includes(needle) ||
    (creator.displayName?.toLowerCase().includes(needle) ?? false)
  );
}

const SORTS: Record<FollowSort, (a: FollowedCreator, b: FollowedCreator) => number> = {
  // The default: who is worth opening. New posts first, then whoever posted
  // most recently — a creator with nothing new still beats one long silent.
  new: (a, b) =>
    b.newPostCount - a.newPostCount ||
    (b.lastPostAt?.getTime() ?? 0) - (a.lastPostAt?.getTime() ?? 0),
  recent: (a, b) => b.followedAt.getTime() - a.followedAt.getTime(),
  oldest: (a, b) => a.followedAt.getTime() - b.followedAt.getTime(),
  az: (a, b) => a.username.localeCompare(b.username),
};

export async function getFollowingList(
  deps: FollowingListDeps,
  userId: string,
  query: FollowingQuery,
): Promise<FollowingList> {
  const since = await deps.follows.getFollowingSeenAt(userId);
  const all = await deps.follows.listFollowedCreators(userId, since);

  const found = query.q ? all.filter((creator) => matches(creator, query.q ?? "")) : all;
  const sorted = [...found].sort(SORTS[query.sort]);
  const start = (query.page - 1) * FOLLOWING_PAGE_SIZE;

  return {
    since,
    rows: sorted.slice(start, start + FOLLOWING_PAGE_SIZE),
    total: found.length,
    followedTotal: all.length,
    page: query.page,
    hasMore: start + FOLLOWING_PAGE_SIZE < found.length,
  };
}

/**
 * Stamp the visit. Called after the list is read, never before — the counts on
 * screen are measured against the PREVIOUS visit, which is the whole point of
 * the "last looked" line.
 */
export async function markFollowingSeen(deps: FollowingListDeps, userId: string): Promise<void> {
  await deps.follows.markFollowingSeen(userId, deps.now());
}
