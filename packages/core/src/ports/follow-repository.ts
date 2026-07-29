import type { ProfileSummary } from "./profile-repository";

/**
 * Port for shopper→creator follows. Writes are idempotent: following twice or
 * unfollowing something never followed is a no-op, not an error — in-app
 * browsers double-fire (§6.8) and a follow toggle must absorb that.
 */

/**
 * One row of /following. Everything here is measured, not modelled: the counts
 * are rows in the database and `newPostCount` is post timestamps against the
 * account's last visit — so the numbers carry the same weight as the rest of
 * the product's (design following.html).
 */
export type FollowedCreator = {
  readonly id: string;
  readonly username: string;
  /** Public name (brief 10); null = show the @username. */
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly postCount: number;
  /** "things" on the page — tagged products. */
  readonly productCount: number;
  readonly followedAt: Date;
  /** Null when the creator has never posted. */
  readonly lastPostAt: Date | null;
  /** Visible posts published since the account last opened /following. */
  readonly newPostCount: number;
};

export type FollowRepository = {
  add(userId: string, profileId: string): Promise<void>;
  remove(userId: string, profileId: string): Promise<void>;
  isFollowing(userId: string, profileId: string): Promise<boolean>;
  /** The simple followed-creators list — id + username only. */
  listProfilesByUser(userId: string): Promise<readonly ProfileSummary[]>;
  /**
   * Every followed creator with its counts, unsorted and unpaged — the
   * /following read model. `since` is the account's last visit; null counts
   * everything as new.
   *
   * ponytail: returns the whole list because a follow list is hundreds, not
   * millions, and sorting by a computed count in SQL costs a view. If someone
   * follows thousands, push the sort and the slice down here.
   */
  listFollowedCreators(userId: string, since: Date | null): Promise<readonly FollowedCreator[]>;
  /** When this account last opened /following; null = never. */
  getFollowingSeenAt(userId: string): Promise<Date | null>;
  /** Stamp the visit, so the next one measures against it. */
  markFollowingSeen(userId: string, at: Date): Promise<void>;
};
