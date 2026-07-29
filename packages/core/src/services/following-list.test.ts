import { describe, expect, it } from "vitest";
import type { FollowRepository, FollowedCreator } from "../ports/follow-repository";
import { FOLLOWING_PAGE_SIZE, getFollowingList, markFollowingSeen } from "./following-list";

const SINCE = new Date("2026-07-20T00:00:00Z");

function creator(over: Partial<FollowedCreator> & { username: string }): FollowedCreator {
  return {
    id: over.username,
    displayName: null,
    avatarUrl: null,
    postCount: 0,
    productCount: 0,
    followedAt: new Date("2026-01-01T00:00:00Z"),
    lastPostAt: null,
    newPostCount: 0,
    ...over,
  };
}

function makeDeps(creators: readonly FollowedCreator[], since: Date | null = SINCE) {
  const seen: Date[] = [];
  const follows: FollowRepository = {
    async add() {},
    async remove() {},
    async isFollowing() {
      return false;
    },
    async listProfilesByUser() {
      return [];
    },
    async listFollowedCreators() {
      return creators;
    },
    async getFollowingSeenAt() {
      return since;
    },
    async markFollowingSeen(_userId, at) {
      seen.push(at);
    },
  };
  const now = new Date("2026-07-29T12:00:00Z");
  return { deps: { follows, now: () => now }, seen, now };
}

const QUERY = { sort: "new", page: 1 } as const;

describe("getFollowingList", () => {
  it("sorts by what is new, then by who posted most recently", async () => {
    const { deps } = makeDeps([
      creator({ username: "quiet", lastPostAt: new Date("2026-01-05T00:00:00Z") }),
      creator({ username: "recent", lastPostAt: new Date("2026-07-25T00:00:00Z") }),
      creator({ username: "busy", newPostCount: 4, lastPostAt: new Date("2026-07-26T00:00:00Z") }),
      creator({ username: "one", newPostCount: 1, lastPostAt: new Date("2026-07-28T00:00:00Z") }),
    ]);

    const list = await getFollowingList(deps, "u1", QUERY);

    expect(list.rows.map((row) => row.username)).toEqual(["busy", "one", "recent", "quiet"]);
    expect(list.since).toEqual(SINCE);
  });

  it("searches handle and display name, and keeps both totals apart", async () => {
    const { deps } = makeDeps([
      creator({ username: "mayamoves", displayName: "Maya Rao" }),
      creator({ username: "arjunbuilds", displayName: "Arjun Mehta" }),
    ]);

    const found = await getFollowingList(deps, "u1", { ...QUERY, q: "maya" });
    expect(found.rows.map((row) => row.username)).toEqual(["mayamoves"]);
    expect(found.total).toBe(1);
    // The "no match" empty state needs to know follows exist at all.
    expect(found.followedTotal).toBe(2);

    const byName = await getFollowingList(deps, "u1", { ...QUERY, q: "MEHTA" });
    expect(byName.rows.map((row) => row.username)).toEqual(["arjunbuilds"]);

    const none = await getFollowingList(deps, "u1", { ...QUERY, q: "nobody" });
    expect(none.rows).toEqual([]);
    expect(none.total).toBe(0);
    expect(none.followedTotal).toBe(2);
  });

  it("pages without losing the total", async () => {
    const many = Array.from({ length: FOLLOWING_PAGE_SIZE + 3 }, (_unused, index) =>
      creator({ username: `c${String(index).padStart(2, "0")}` }),
    );
    const { deps } = makeDeps(many);

    const first = await getFollowingList(deps, "u1", { ...QUERY, sort: "az" });
    expect(first.rows).toHaveLength(FOLLOWING_PAGE_SIZE);
    expect(first.hasMore).toBe(true);
    expect(first.total).toBe(many.length);

    const second = await getFollowingList(deps, "u1", { sort: "az", page: 2 });
    expect(second.rows).toHaveLength(3);
    expect(second.hasMore).toBe(false);
    expect(second.rows[0]?.username).toBe(`c${String(FOLLOWING_PAGE_SIZE).padStart(2, "0")}`);
  });

  it("orders by when the follow happened, both ways", async () => {
    const { deps } = makeDeps([
      creator({ username: "old", followedAt: new Date("2025-01-01T00:00:00Z") }),
      creator({ username: "new", followedAt: new Date("2026-07-01T00:00:00Z") }),
    ]);

    const recent = await getFollowingList(deps, "u1", { ...QUERY, sort: "recent" });
    expect(recent.rows.map((row) => row.username)).toEqual(["new", "old"]);

    const oldest = await getFollowingList(deps, "u1", { ...QUERY, sort: "oldest" });
    expect(oldest.rows.map((row) => row.username)).toEqual(["old", "new"]);
  });

  it("reads the counts against the previous visit, then stamps this one", async () => {
    const { deps, seen, now } = makeDeps([creator({ username: "maya", newPostCount: 2 })]);

    const list = await getFollowingList(deps, "u1", QUERY);
    expect(list.rows[0]?.newPostCount).toBe(2);
    expect(seen).toEqual([]);

    await markFollowingSeen(deps, "u1");
    expect(seen).toEqual([now]);
  });
});
