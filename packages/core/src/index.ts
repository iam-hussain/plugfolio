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
export type { CodeCopyRepository, CodeCopy, NewCodeCopy } from "./ports/code-copy-repository";
export type {
  AuthAccount,
  AuthAccountRepository,
  AuthTokenRepository,
  AuthMailer,
} from "./ports/auth-account-repository";
export type {
  CreatorPageReadRepository,
  CreatorPage,
  PageCategory,
  ShopperPost,
  ShopperProduct,
  ShopperProductView,
} from "./ports/creator-page-repository";
export type {
  DiscoveryReadRepository,
  DiscoveryCreator,
  DiscoveryProduct,
} from "./ports/discovery-repository";
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
export type {
  SocialProvider,
  SocialTokens,
  SocialConnectionRepository,
  YouTubeChannel,
  YouTubeGateway,
} from "./ports/social-connection-repository";
export type { FollowRepository } from "./ports/follow-repository";
export type {
  CommentRepository,
  CommentView,
  CommentThread,
  CommentTarget,
  NewComment,
} from "./ports/comment-repository";
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
  recordCodeCopyInput,
  type RecordCodeCopyInput,
  type RecordCodeCopyCommand,
} from "./schemas/code-copy";
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
  productKind,
  type ProductKind,
  tagProductInput,
  type TagProductInput,
  updateProductInput,
  type UpdateProductInput,
  setProductCouponInput,
  type SetProductCouponInput,
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
export {
  registerInput,
  type RegisterInput,
  credentialsInput,
  type CredentialsInput,
  emailOnlyInput,
  type EmailOnlyInput,
  verifyEmailInput,
  type VerifyEmailInput,
  resetPasswordInput,
  type ResetPasswordInput,
} from "./schemas/account-auth";

// Services (use-cases)
export { recordOutboundTap, type RecordOutboundTapDeps } from "./services/record-outbound-tap";
export { recordCodeCopy, type RecordCodeCopyDeps } from "./services/record-code-copy";
export {
  getCreatorPage,
  getShopperPost,
  getShopperProduct,
  listProfileProducts,
  type CreatorPageReadDeps,
} from "./services/creator-page-reads";
export { exploreCreators, exploreProducts, type ExploreDeps } from "./services/explore";
export { getEarnings, type EarningsReadDeps } from "./services/get-earnings";
export { getMyProfiles, type ProfileReadDeps } from "./services/get-my-profiles";
export {
  listYouTubeChannels,
  type ListYouTubeChannelsDeps,
  type YouTubeConnectionView,
} from "./services/list-youtube-channels";
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
  setProductCoupon,
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
  registerAccount,
  resendVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  verifyCredentials,
  type AccountAuthDeps,
  type CredentialsResult,
} from "./services/account-auth";
export { hashPassword } from "./auth/password";
// Admin app (docs/implementation/admin-app.md)
export type {
  AdminAccount,
  AdminUserRepository,
  AdminAuditEntry,
  AdminAuditView,
  AdminAuditRepository,
  AppSettingsRepository,
  AdminMemberRow,
  AdminMemberRepository,
  AdminOverview,
  AdminOverviewRepository,
} from "./ports/admin-repository";
export {
  verifyAdminCredentials,
  type AdminAuthDeps,
  type AdminCredentialsResult,
} from "./services/admin-auth";
export {
  BASELINE_RESERVED_USERNAMES,
  getReservedUsernames,
  setReservedUsernames,
  isUsernameReserved,
  getFeatureFlags,
  isFeatureEnabled,
  setFeatureFlag,
  removeFeatureFlag,
  type AppSettingsDeps,
  type AppSettingsAdminDeps,
} from "./services/app-settings";
export {
  searchMembers,
  suspendMember,
  unsuspendMember,
  type AdminMembersDeps,
} from "./services/admin-members";
export type {
  AdminProfileRow,
  AdminProfileRepository,
  AdminCommentRow,
  AdminPostRow,
  AdminProductRow,
  AdminContentRepository,
} from "./ports/admin-repository";
export {
  searchProfiles,
  suspendProfile,
  unsuspendProfile,
  releaseProfileUsername,
  type AdminProfilesDeps,
} from "./services/admin-profiles";
export { releaseUsernameInput, type ReleaseUsernameInput } from "./schemas/admin";
export { generateProfileUsername } from "./services/creator-content";
export {
  searchComments,
  searchPosts,
  searchProducts,
  deleteComment,
  deletePost,
  deleteProduct,
  clearProductCoupon,
  type AdminContentDeps,
} from "./services/admin-content";
export type {
  AdminBusinessRow,
  AdminBusinessRepository,
  AdminRequirementRow,
  AdminRequirementRepository,
  AdminCollabRow,
  AdminCollabRepository,
  AdminAnalytics,
  AdminAnalyticsRepository,
} from "./ports/admin-repository";
export {
  searchBusinesses,
  searchRequirements,
  listCollabs,
  clearBusinessLogo,
  removeRequirement,
  type AdminOversightDeps,
} from "./services/admin-oversight";
export {
  followProfile,
  unfollowProfile,
  getFollowedProfiles,
  isFollowingProfile,
  addComment,
  getComments,
  getProductComments,
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
