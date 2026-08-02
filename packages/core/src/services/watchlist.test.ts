import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type { WatchlistRepository } from "../ports/watchlist-repository";
import type { WatchKind } from "../schemas/watchlist";
import { getWatchlist, isWatched, unwatchTarget, watchTarget } from "./watchlist";

const USER_ID = "22222222-2222-2222-2222-222222222222";
const PRODUCT_ID = "44444444-4444-4444-4444-444444444444";
const GONE_ID = "55555555-5555-5555-5555-555555555555";

/** In-memory fake — the service stays testable without Prisma. */
function makeFakeWatchlist(): WatchlistRepository & { rows: Set<string> } {
  const rows = new Set<string>();
  const key = (userId: string, kind: WatchKind, targetId: string) =>
    `${userId}:${kind}:${targetId}`;
  return {
    rows,
    async add(userId, kind, targetId) {
      rows.add(key(userId, kind, targetId));
    },
    async remove(userId, kind, targetId) {
      rows.delete(key(userId, kind, targetId));
    },
    async isWatched(userId, kind, targetId) {
      return rows.has(key(userId, kind, targetId));
    },
    async targetExists(_kind, targetId) {
      return targetId !== GONE_ID;
    },
    async listByUser() {
      return [];
    },
  };
}

describe("watchlist", () => {
  it("saves, reports saved, and removes", async () => {
    const watchlist = makeFakeWatchlist();
    const deps = { watchlist };
    const input = { kind: "product" as const, targetId: PRODUCT_ID };

    await watchTarget(deps, USER_ID, input);
    expect(await isWatched(deps, USER_ID, "product", PRODUCT_ID)).toBe(true);

    await unwatchTarget(deps, USER_ID, input);
    expect(await isWatched(deps, USER_ID, "product", PRODUCT_ID)).toBe(false);
    expect(await getWatchlist(deps, USER_ID)).toEqual([]);
  });

  it("absorbs a double-fired save and a removal of nothing", async () => {
    const watchlist = makeFakeWatchlist();
    const deps = { watchlist };
    const input = { kind: "post" as const, targetId: PRODUCT_ID };

    await watchTarget(deps, USER_ID, input);
    await watchTarget(deps, USER_ID, input);
    expect(watchlist.rows.size).toBe(1);

    await unwatchTarget(deps, USER_ID, input);
    await unwatchTarget(deps, USER_ID, input);
    expect(watchlist.rows.size).toBe(0);
  });

  it("refuses to save something that isn't there", async () => {
    const watchlist = makeFakeWatchlist();
    await expect(
      watchTarget({ watchlist }, USER_ID, { kind: "product", targetId: GONE_ID }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(watchlist.rows.size).toBe(0);
  });
});
