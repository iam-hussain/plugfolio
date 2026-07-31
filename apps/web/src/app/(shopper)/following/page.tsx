import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  FOLLOWING_PAGE_SIZE,
  followingQuery,
  getFollowingList,
  markFollowingSeen,
} from "@plugfolio/core";
import { FollowingPage } from "@/features/shopper-account";
import { auth } from "@/server/auth";
import { clock, repositories } from "@/server/container";

// The shopper-account payoff (lean journey): the followed-creators list, with
// the per-creator "new since you last looked" counts (design following.html).
// Still not a feed — nothing here merges anyone's posts into a stream. Gated:
// following is an "act as yourself" action; shopping never routes here (§2.2).
export const metadata: Metadata = { title: "Following" };

type SearchParams = { q?: string; sort?: string; page?: string };

export default async function FollowingRoute({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const query = followingQuery.parse(await searchParams);
  const deps = { follows: repositories.follows, now: clock.now };
  const list = await getFollowingList(deps, session.user.id, query);

  // Stamp the visit AFTER the read: what's on screen is measured against the
  // previous one, which is the whole point of the "last looked" line.
  await markFollowingSeen(deps, session.user.id);

  return (
    <FollowingPage
      rows={list.rows}
      since={list.since}
      now={clock.now()}
      search={query.q ?? ""}
      sort={query.sort}
      page={list.page}
      total={list.total}
      followedTotal={list.followedTotal}
      hasMore={list.hasMore}
      pageSize={FOLLOWING_PAGE_SIZE}
    />
  );
}
