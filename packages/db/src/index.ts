/** Public surface of the data layer. */
export { prisma, type PrismaClient } from "./client";
export { createTapRepository } from "./repositories/tap-repository";
export { createCodeCopyRepository } from "./repositories/code-copy-repository";
export { createProductRepository } from "./repositories/product-repository";
export { createCreatorPageRepository } from "./repositories/creator-page-repository";
export { createDiscoveryRepository } from "./repositories/discovery-repository";
export { createTrafficRepository } from "./repositories/traffic-repository";
export { createViewRepository, createViewTargetRepository } from "./repositories/view-repository";
export {
  createProfileRepository,
  createProfileIdentityRepository,
} from "./repositories/profile-repository";
export { createFollowRepository } from "./repositories/follow-repository";
export { createWatchlistRepository } from "./repositories/watchlist-repository";
export { createAdPlacementRepository } from "./repositories/ad-placement-repository";
export { createCommentRepository } from "./repositories/comment-repository";
export { createCategoryRepository } from "./repositories/category-repository";
export { createProfileLinkRepository } from "./repositories/profile-link-repository";
export {
  createBusinessRepository,
  createRequirementRepository,
  createCollabRepository,
} from "./repositories/business-collab-repository";
export { createAuthAdapter } from "./auth-adapter";
export {
  createAuthAccountRepository,
  createAuthTokenRepository,
} from "./repositories/auth-account-repository";
export { createSessionRepository } from "./repositories/session-repository";
export { createManagerRepository, createUserRepository } from "./repositories/manager-repository";
export {
  createAdminUserRepository,
  createAdminAuditRepository,
  createAppSettingsRepository,
  createAdminMemberRepository,
  createAdminReportRepository,
  createAdminOverviewRepository,
} from "./repositories/admin-repository";
export {
  createAdminProfileRepository,
  createAdminContentRepository,
} from "./repositories/admin-moderation-repository";
export { createReportWriteRepository } from "./repositories/report-repository";
export {
  createSupportTicketWriteRepository,
  createAdminSupportRepository,
} from "./repositories/support-repository";
export {
  createAdminBusinessRepository,
  createAdminRequirementRepository,
  createAdminCollabRepository,
  createAdminAnalyticsRepository,
} from "./repositories/admin-oversight-repository";
export {
  createConnectionRepository,
  createSocialConnectionRepository,
  createPostWriteRepository,
  createProductWriteRepository,
} from "./repositories/creator-content-repository";
