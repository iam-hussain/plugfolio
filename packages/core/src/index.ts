/**
 * Public surface of the domain (§5: import from a package's index, never its
 * internals). The HTTP layer and services composition wire against these.
 */

// Errors
export * from "./errors";

// Domain
export type { OutboundTap, NewOutboundTap, TapSource } from "./domain/tap";

// Ports (repository interfaces implemented in @plugfolio/db)
export type { TapRepository } from "./ports/tap-repository";
export type { ProductReadRepository, ProductForAttribution } from "./ports/product-repository";
export type {
  CreatorPageReadRepository,
  CreatorPage,
  ShopperPost,
  ShopperProduct,
  ShopperProductView,
} from "./ports/creator-page-repository";
export type {
  EarningsReadRepository,
  EarningsSummary,
  PostTapCount,
  ProductTapCount,
} from "./ports/earnings-repository";
export type { ProfileReadRepository, ProfileSummary } from "./ports/profile-repository";
export type { FollowRepository } from "./ports/follow-repository";
export type { CommentRepository, CommentView, NewComment } from "./ports/comment-repository";

// Schemas
export {
  recordOutboundTapInput,
  type RecordOutboundTapInput,
  type RecordOutboundTapCommand,
} from "./schemas/tap";
export {
  followProfileInput,
  type FollowProfileInput,
  addCommentInput,
  type AddCommentInput,
} from "./schemas/shopper-social";

// Services (use-cases)
export { recordOutboundTap, type RecordOutboundTapDeps } from "./services/record-outbound-tap";
export {
  getCreatorPage,
  getShopperPost,
  getShopperProduct,
  type CreatorPageReadDeps,
} from "./services/creator-page-reads";
export { getEarnings, type EarningsReadDeps } from "./services/get-earnings";
export { getMyProfiles, type ProfileReadDeps } from "./services/get-my-profiles";
export {
  followProfile,
  unfollowProfile,
  getFollowedProfiles,
  isFollowingProfile,
  addComment,
  getComments,
  type ShopperSocialDeps,
} from "./services/shopper-social";
