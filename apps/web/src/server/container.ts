import {
  createBusinessRepository,
  createCollabRepository,
  createCommentRepository,
  createCreatorPageRepository,
  createEarningsRepository,
  createFollowRepository,
  createProductRepository,
  createProfileRepository,
  createRequirementRepository,
  createTapRepository,
} from "@plugfolio/db";

/**
 * Composition root: the app wires domain services to their concrete Prisma
 * repositories here. Services (in @plugfolio/core) stay ignorant of Prisma; this
 * is the only seam that knows both sides (§6 layering).
 */
export const repositories = {
  taps: createTapRepository(),
  products: createProductRepository(),
  creatorPages: createCreatorPageRepository(),
  earnings: createEarningsRepository(),
  profiles: createProfileRepository(),
  follows: createFollowRepository(),
  comments: createCommentRepository(),
  businesses: createBusinessRepository(),
  requirements: createRequirementRepository(),
  collabs: createCollabRepository(),
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
