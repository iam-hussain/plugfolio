/**
 * The shopper-account use-cases (§2.2: follow and comment are the ONLY things
 * behind that door in v1), split by concern into `./follows` and `./comments`.
 * This module re-exports both and defines the combined dependency bundle, since
 * a composition root wires them together as one `shopperSocialDeps`.
 */
import type { CommentDeps } from "./comments";
import type { FollowDeps } from "./follows";

export * from "./follows";
export * from "./comments";

/** The follow + comment repositories a shopper-account composition wires once. */
export type ShopperSocialDeps = FollowDeps & CommentDeps;
