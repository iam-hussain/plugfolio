import { NotFoundError } from "../errors";
import type { WatchlistItem, WatchlistRepository } from "../ports/watchlist-repository";
import type { WatchKind, WatchTargetInput } from "../schemas/watchlist";

/**
 * The watchlist use-cases — the shopper's own shelf: a post or a product,
 * saved for later, kept beside the creator who tagged it.
 *
 * It is a save, not a cart and not a feed: nothing here holds a price, reserves
 * stock or merges anyone's posts into a stream (§2.3). Every route out goes to
 * the thing's own page, which is where buying happens — and buying still never
 * needs the account this list sits behind (§2.2).
 *
 * Callers pass the session-verified userId, never a client-supplied one.
 */
export type WatchlistDeps = {
  watchlist: WatchlistRepository;
};

export async function watchTarget(
  deps: WatchlistDeps,
  userId: string,
  input: WatchTargetInput,
): Promise<void> {
  // Checked here rather than trusted: without a foreign key, a bogus id would
  // otherwise sit in the list forever as a row that renders nothing.
  if (!(await deps.watchlist.targetExists(input.kind, input.targetId))) {
    throw new NotFoundError(input.kind === "post" ? "Post not found" : "Product not found");
  }
  await deps.watchlist.add(userId, input.kind, input.targetId);
}

export async function unwatchTarget(
  deps: WatchlistDeps,
  userId: string,
  input: WatchTargetInput,
): Promise<void> {
  await deps.watchlist.remove(userId, input.kind, input.targetId);
}

export async function isWatched(
  deps: WatchlistDeps,
  userId: string,
  kind: WatchKind,
  targetId: string,
): Promise<boolean> {
  return deps.watchlist.isWatched(userId, kind, targetId);
}

export async function getWatchlist(
  deps: WatchlistDeps,
  userId: string,
): Promise<readonly WatchlistItem[]> {
  return deps.watchlist.listByUser(userId);
}
