/** Public surface of the data layer. */
export { prisma, type PrismaClient } from "./client";
export { createTapRepository } from "./repositories/tap-repository";
export { createProductRepository } from "./repositories/product-repository";
export { createCreatorPageRepository } from "./repositories/creator-page-repository";
export { createEarningsRepository } from "./repositories/earnings-repository";
export { createProfileRepository } from "./repositories/profile-repository";
export { createFollowRepository } from "./repositories/follow-repository";
export { createCommentRepository } from "./repositories/comment-repository";
export { createCategoryRepository } from "./repositories/category-repository";
export {
  createBusinessRepository,
  createRequirementRepository,
  createCollabRepository,
} from "./repositories/business-collab-repository";
export { createAuthAdapter } from "./auth-adapter";
export { createSessionRepository } from "./repositories/session-repository";
export { createManagerRepository, createUserRepository } from "./repositories/manager-repository";
export {
  createConnectionRepository,
  createPostWriteRepository,
  createProductWriteRepository,
} from "./repositories/creator-content-repository";
