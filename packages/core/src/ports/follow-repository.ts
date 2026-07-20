import type { ProfileSummary } from "./profile-repository";

/**
 * Port for shopper→creator follows. Writes are idempotent: following twice or
 * unfollowing something never followed is a no-op, not an error — in-app
 * browsers double-fire (§6.8) and a follow toggle must absorb that.
 */
export type FollowRepository = {
  add(userId: string, profileId: string): Promise<void>;
  remove(userId: string, profileId: string): Promise<void>;
  isFollowing(userId: string, profileId: string): Promise<boolean>;
  /** The shopper-account payoff: the simple followed-creators list. */
  listProfilesByUser(userId: string): Promise<readonly ProfileSummary[]>;
};
