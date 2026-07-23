import {
  createBusinessRepository,
  createCategoryRepository,
  createConnectionRepository,
  createManagerRepository,
  createCollabRepository,
  createCommentRepository,
  createCreatorPageRepository,
  createDiscoveryRepository,
  createEarningsRepository,
  createFollowRepository,
  createProfileRepository,
  createRequirementRepository,
  createSocialConnectionRepository,
  createUserRepository,
} from "@plugfolio/db";
import { createYouTubeGateway } from "./youtube";

/**
 * Composition root: the app wires domain services to their concrete Prisma
 * repositories here. Services (in @plugfolio/core) stay ignorant of Prisma; this
 * is the only seam that knows both sides (§6 layering).
 */
export const repositories = {
  creatorPages: createCreatorPageRepository(),
  discovery: createDiscoveryRepository(),
  earnings: createEarningsRepository(),
  profiles: createProfileRepository(),
  follows: createFollowRepository(),
  comments: createCommentRepository(),
  categories: createCategoryRepository(),
  businesses: createBusinessRepository(),
  requirements: createRequirementRepository(),
  collabs: createCollabRepository(),
  connections: createConnectionRepository(),
  socialConnections: createSocialConnectionRepository(),
  managers: createManagerRepository(),
  users: createUserRepository(),
};

export const clock = { now: () => new Date() };

/** The business-collab service dependency bundle, wired once. */
export const businessCollabDeps = {
  businesses: repositories.businesses,
  requirements: repositories.requirements,
  collabs: repositories.collabs,
  profiles: repositories.profiles,
  now: clock.now,
};

export const youtubeDeps = {
  connections: repositories.socialConnections,
  youtube: createYouTubeGateway(),
  now: clock.now,
};

export const profileManagerDeps = {
  profiles: repositories.profiles,
  managers: repositories.managers,
  users: repositories.users,
};
