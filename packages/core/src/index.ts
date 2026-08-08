/**
 * Public surface of the domain (§5: import from a package's index, never its
 * internals). The HTTP layer and services composition wire against these.
 */

// Errors
export * from "./errors";

// Anonymous shopper identity (§6.7, ADR-0002) — shared by both deployables
export { DEVICE_COOKIE, verifyDeviceToken, issueDeviceToken } from "./auth/device-token";
// The guessable-secret guard: admin sign-in (ADR-0014), verify codes (ADR-0024)
export { createFailureLimit, type FailureLimit } from "./auth/rate-limit";

// Composition helpers — shared wiring for every app's composition root (§6)
export {
  systemClock,
  makeBusinessCollabDeps,
  makeProfileLinkDeps,
  makeProfileIdentityDeps,
  makeProfileManagerDeps,
  selectAuthMailer,
} from "./composition/wiring";

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
  CreatorProductRow,
  PageCategory,
  ShopperPost,
  MediaKind,
  ShopperProduct,
  ShopperProductView,
} from "./ports/creator-page-repository";
export type {
  DiscoveryReadRepository,
  DiscoveryCreator,
  DiscoveryProduct,
  DiscoveryPost,
  DiscoveryPostTag,
} from "./ports/discovery-repository";
export type {
  TrafficReadRepository,
  TrafficSummary,
  TrafficRange,
  TrafficBucket,
  TrafficSource,
  SummarizeOptions,
  PostTraffic,
  ProductTraffic,
  CodeCopyCount,
} from "./ports/traffic-repository";
export type {
  View,
  NewView,
  ViewSurface,
  ViewRepository,
  ViewTargetRepository,
} from "./ports/view-repository";
export type {
  ProfileRepository,
  ProfileSummary,
  ProfileRole,
  AccessibleProfile,
  ProfileContentCounts,
} from "./ports/profile-repository";
export type { ManagerRepository, ManagerView, UserRepository } from "./ports/manager-repository";
export type { SessionRepository } from "./ports/session-repository";
export type {
  ConnectionReadRepository,
  PostWriteRepository,
  ProductWriteRepository,
  ProductMetadata,
  ProductMetadataGateway,
} from "./ports/creator-content-repository";
export type { ImageSpec, ProcessedImage, ImageProcessor, ImageStore } from "./ports/image-storage";
export { uploadImage, type UploadImageDeps, type UploadedImage } from "./services/upload-image";
export type {
  SocialProvider,
  SocialTokens,
  SocialConnectionRepository,
  YouTubeChannel,
  YouTubeGateway,
} from "./ports/social-connection-repository";
export type { FollowRepository, FollowedCreator } from "./ports/follow-repository";
export type { WatchlistRepository, WatchlistItem } from "./ports/watchlist-repository";
export type { AdPlacement, AdPlacementRepository } from "./ports/ad-placement-repository";
export type {
  CommentRepository,
  CommentView,
  CommentThread,
  CommentTarget,
  CommentQuery,
  CommentPage,
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

// Schemas — the Zod boundary (§6.4), one sub-barrel
export * from "./schemas";
export {
  getLiveAdPlacement,
  listAdPlacements,
  createAdPlacement,
  removeAdPlacement,
  ADS_FLAG,
  type AdPlacementDeps,
} from "./services/ad-placements";
export { type ProfileLinkRepository, type ProfileLinkView } from "./ports/profile-link-repository";
export {
  getProfileLinks,
  listMyProfileLinks,
  setProfileLinks,
  type ProfileLinkDeps,
} from "./services/profile-links";
export {
  type ProfileIdentity,
  type PageAppearance,
  type ProfileIdentityRepository,
} from "./ports/profile-identity-repository";
export {
  getMyProfileIdentity,
  updateProfileIdentity,
  deleteProfile,
  type ProfileIdentityDeps,
} from "./services/profile-identity";

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
export {
  EXPLORE_PAGE_SIZE,
  exploreCreators,
  exploreProducts,
  explorePosts,
  type ExploreDeps,
} from "./services/explore";
export {
  classifyReferrer,
  getTraffic,
  parseTrafficRange,
  tapThroughRate,
  TRAFFIC_RANGES,
  type TrafficReadDeps,
} from "./services/get-traffic";
export { recordView, type RecordViewDeps } from "./services/record-view";
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
  updatePost,
  createProduct,
  updateProduct,
  connectProductToPost,
  disconnectProductFromPost,
  createCategory,
  updateCategory,
  removeCategory,
  setPostCategory,
  setPostHidden,
  setProductCategory,
  MAX_PROFILES_PER_ACCOUNT,
  type CreatorContentDeps,
  type CategoryDeps,
} from "./services/creator-content";
export {
  generateMemberHandle,
  updateMemberHandle,
  updateMemberImage,
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
  sendSetPasswordLink,
  type AccountAuthDeps,
  type VerifyEmailDeps,
  type CredentialsResult,
} from "./services/account-auth";
export { hashPassword } from "./auth/password";
// Admin app (docs/implementation/admin-app.md)
export type {
  Page,
  PageQuery,
  AdminAccount,
  AdminOperatorRow,
  AdminUserRepository,
  AdminAuditEntry,
  AdminAuditView,
  AdminAuditFilter,
  AdminAuditRepository,
  AppSettingsRepository,
  AdminMemberRow,
  AdminMemberDetail,
  MemberStatusFilter,
  AdminMemberRepository,
  AdminOverview,
  AdminOverviewRepository,
  AdminProfileDetail,
  ProfileStatusFilter,
  ProductCouponFilter,
  AdminCollabMessage,
  AdminCollabThread,
  ReportTargetType,
  ReportCategory,
  ReportStatus,
  AdminReportRow,
  AdminReportRepository,
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
  getMemberDetail,
  suspendMember,
  unsuspendMember,
  suspendMembersBulk,
  deleteMemberAccount,
  resetMemberHandle,
  type AdminMembersDeps,
  type AdminResetHandleDeps,
} from "./services/admin-members";
export {
  listReports,
  resolveReport,
  dismissReport,
  type AdminReportsDeps,
} from "./services/admin-reports";
export {
  createReport,
  type CreateReportDeps,
  type NewReport,
  type ReportWriteRepository,
} from "./services/reports";
export type {
  SupportTicketStatus,
  NewSupportTicket,
  SupportTicketWriteRepository,
  AdminSupportTicketRow,
  AdminSupportRepository,
} from "./ports/support-repository";
export {
  createSupportTicket,
  listSupportTickets,
  resolveSupportTicket,
  dismissSupportTicket,
  type CreateSupportTicketDeps,
  type AdminSupportDeps,
} from "./services/support";
export { createTwilioMailer, type TwilioMailerConfig } from "./adapters/twilio-mailer";
export {
  verificationEmail,
  passwordResetEmail,
  managerInviteEmail,
  type EmailContent,
  type ManagerInviteContext,
} from "./adapters/email-templates";
export {
  listOperators,
  inviteOperator,
  removeOperator,
  sendOperatorPasswordReset,
  setOperatorPasswordWithToken,
  changeOwnPassword,
  type AdminOperatorsDeps,
} from "./services/admin-operators";
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
  getProfileDetail,
  suspendProfile,
  unsuspendProfile,
  releaseProfileUsername,
  type AdminProfilesDeps,
} from "./services/admin-profiles";
export { generateProfileUsername } from "./services/creator-content";
export {
  searchComments,
  searchPosts,
  searchProducts,
  deleteComment,
  deletePost,
  deleteProduct,
  clearProductCoupon,
  deleteCommentsBulk,
  deletePostsBulk,
  deleteProductsBulk,
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
  getAdminCollabThread,
  deleteCollabMessage,
  clearBusinessLogo,
  removeRequirement,
  type AdminOversightDeps,
  type AdminCollabsDeps,
} from "./services/admin-oversight";
export {
  followProfile,
  unfollowProfile,
  getFollowedProfiles,
  isFollowingProfile,
  addComment,
  getComments,
  getProductComments,
  reactToComment,
  COMMENTS_PAGE_SIZE,
  type CommentReadOptions,
  type ShopperSocialDeps,
} from "./services/shopper-social";
export {
  getFollowingList,
  markFollowingSeen,
  FOLLOWING_PAGE_SIZE,
  type FollowingList,
  type FollowingListDeps,
} from "./services/following-list";
export {
  watchTarget,
  unwatchTarget,
  isWatched,
  getWatchlist,
  type WatchlistDeps,
} from "./services/watchlist";
export {
  createBusiness,
  getMyBusiness,
  postRequirement,
  listOpenRequirements,
  listMyRequirements,
  approachRequirement,
  requestCollab,
  sendCollabMessage,
  proposeCollabTerms,
  closeRequirement,
  agreeCollab,
  getCollabThread,
  listMyBusinessCollabs,
  listMyCreatorCollabs,
  type BusinessCollabDeps,
} from "./services/business-collab";
