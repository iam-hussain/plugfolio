/**
 * Public surface of the domain (§5: import from a package's index, never its
 * internals). The HTTP layer and services composition wire against these.
 */

// Errors
export * from "./errors";

// Anonymous shopper identity (§6.7, ADR-0002) — shared by both deployables
export {
  DEVICE_COOKIE,
  verifyDeviceToken,
  issueDeviceToken,
} from "./auth/device-token";

// Domain
export type { OutboundTap, NewOutboundTap, TapSource } from "./domain/tap";

// Ports (repository interfaces implemented in @plugfolio/db)
export type { TapRepository } from "./ports/tap-repository";
export type { ProductReadRepository, ProductForAttribution } from "./ports/product-repository";
export type {
  CreatorPageReadRepository,
  CreatorPage,
  PageCategory,
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
export type {
  ProfileRepository,
  ProfileSummary,
  ProfileRole,
  AccessibleProfile,
} from "./ports/profile-repository";
export type { ManagerRepository, ManagerView, UserRepository } from "./ports/manager-repository";
export type {
  ConnectionReadRepository,
  PostWriteRepository,
  ProductWriteRepository,
  ProductMetadata,
  ProductMetadataGateway,
} from "./ports/creator-content-repository";
export type { FollowRepository } from "./ports/follow-repository";
export type { CommentRepository, CommentView, NewComment } from "./ports/comment-repository";
export type {
  CategoryRepository,
  CategoryView,
  NewCategory,
  CategoryPatch,
} from "./ports/category-repository";
export type {
  Business,
  BusinessRepository,
  RequirementRepository,
  RequirementView,
  CollabRepository,
  CollabSummary,
  CollabThread,
  CollabMessageView,
} from "./ports/business-collab-repository";

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
export {
  createBusinessInput,
  type CreateBusinessInput,
  postRequirementInput,
  type PostRequirementInput,
  approachRequirementInput,
  type ApproachRequirementInput,
  requestCollabInput,
  type RequestCollabInput,
  collabMessageInput,
  type CollabMessageInput,
} from "./schemas/business-collab";
export {
  createPostInput,
  type CreatePostInput,
  tagProductInput,
  type TagProductInput,
  updateProductInput,
  type UpdateProductInput,
  createCategoryInput,
  type CreateCategoryInput,
  updateCategoryInput,
  type UpdateCategoryInput,
  setPostCategoryInput,
  type SetPostCategoryInput,
  setProductCategoryInput,
  type SetProductCategoryInput,
} from "./schemas/creator-content";
export {
  updateMemberHandleInput,
  type UpdateMemberHandleInput,
} from "./schemas/member-handle";

// Services (use-cases)
export { recordOutboundTap, type RecordOutboundTapDeps } from "./services/record-outbound-tap";
export {
  getCreatorPage,
  getShopperPost,
  getShopperProduct,
  listProfileProducts,
  type CreatorPageReadDeps,
} from "./services/creator-page-reads";
export { getEarnings, type EarningsReadDeps } from "./services/get-earnings";
export { getMyProfiles, type ProfileReadDeps } from "./services/get-my-profiles";
export {
  inviteManager,
  inviteManagerInput,
  type InviteManagerInput,
  removeManager,
  listManagers,
  MAX_MANAGERS_PER_PROFILE,
  type ProfileManagerDeps,
} from "./services/profile-managers";
export {
  createProfile,
  createPost,
  tagProductToPost,
  updateProductAffiliateUrl,
  removeProduct,
  listMyCategories,
  createCategory,
  updateCategory,
  removeCategory,
  setPostCategory,
  setProductCategory,
  MAX_PROFILES_PER_ACCOUNT,
  type CreatorContentDeps,
  type CategoryDeps,
} from "./services/creator-content";
export {
  generateMemberHandle,
  updateMemberHandle,
  getMemberHandle,
  type MemberHandleDeps,
} from "./services/member-handle";
export {
  followProfile,
  unfollowProfile,
  getFollowedProfiles,
  isFollowingProfile,
  addComment,
  getComments,
  type ShopperSocialDeps,
} from "./services/shopper-social";
export {
  createBusiness,
  getMyBusiness,
  postRequirement,
  listOpenRequirements,
  listMyRequirements,
  approachRequirement,
  requestCollab,
  sendCollabMessage,
  agreeCollab,
  getCollabThread,
  listMyBusinessCollabs,
  listMyCreatorCollabs,
  type BusinessCollabDeps,
} from "./services/business-collab";
