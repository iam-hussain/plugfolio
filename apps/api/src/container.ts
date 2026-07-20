import {
  createBusinessRepository,
  createCollabRepository,
  createCommentRepository,
  createFollowRepository,
  createProductRepository,
  createProfileRepository,
  createRequirementRepository,
  createSessionRepository,
  createTapRepository,
} from "@plugfolio/db";

/**
 * Composition root: the API wires domain services to their concrete Prisma
 * repositories here (§6 layering) — the same seam apps/web has for its
 * server-rendered reads.
 */
export const repositories = {
  taps: createTapRepository(),
  products: createProductRepository(),
  profiles: createProfileRepository(),
  follows: createFollowRepository(),
  comments: createCommentRepository(),
  businesses: createBusinessRepository(),
  requirements: createRequirementRepository(),
  collabs: createCollabRepository(),
  sessions: createSessionRepository(),
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
