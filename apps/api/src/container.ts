import {
  createBusinessRepository,
  createCategoryRepository,
  createCodeCopyRepository,
  createConnectionRepository,
  createManagerRepository,
  createCollabRepository,
  createCommentRepository,
  createFollowRepository,
  createProductRepository,
  createPostWriteRepository,
  createProductWriteRepository,
  createProfileRepository,
  createRequirementRepository,
  createSessionRepository,
  createTapRepository,
  createUserRepository,
} from "@plugfolio/db";
import { createOgMetadataGateway } from "./gateways/og-metadata";

/**
 * Composition root: the API wires domain services to their concrete Prisma
 * repositories here (§6 layering) — the same seam apps/web has for its
 * server-rendered reads.
 */
export const repositories = {
  taps: createTapRepository(),
  codeCopies: createCodeCopyRepository(),
  products: createProductRepository(),
  profiles: createProfileRepository(),
  follows: createFollowRepository(),
  comments: createCommentRepository(),
  categories: createCategoryRepository(),
  businesses: createBusinessRepository(),
  requirements: createRequirementRepository(),
  collabs: createCollabRepository(),
  sessions: createSessionRepository(),
  connections: createConnectionRepository(),
  managers: createManagerRepository(),
  users: createUserRepository(),
  postWrites: createPostWriteRepository(),
  productWrites: createProductWriteRepository(),
};

export const clock = { now: () => new Date() };

export const shopperSocialDeps = {
  follows: repositories.follows,
  comments: repositories.comments,
  profiles: repositories.profiles,
};

export const businessCollabDeps = {
  businesses: repositories.businesses,
  requirements: repositories.requirements,
  collabs: repositories.collabs,
  profiles: repositories.profiles,
  now: clock.now,
};

export const creatorContentDeps = {
  profiles: repositories.profiles,
  connections: repositories.connections,
  posts: repositories.postWrites,
  products: repositories.products,
  productWrites: repositories.productWrites,
  categories: repositories.categories,
  metadata: createOgMetadataGateway(),
};

export const profileManagerDeps = {
  profiles: repositories.profiles,
  managers: repositories.managers,
  users: repositories.users,
};
