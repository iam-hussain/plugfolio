import {
  makeBusinessCollabDeps,
  makeProfileIdentityDeps,
  makeProfileLinkDeps,
  makeProfileManagerDeps,
  systemClock,
} from "@plugfolio/core";
import {
  createAppSettingsRepository,
  createBusinessRepository,
  createCategoryRepository,
  createConnectionRepository,
  createProfileIdentityRepository,
  createProfileLinkRepository,
  createManagerRepository,
  createCollabRepository,
  createCommentRepository,
  createCreatorPageRepository,
  createDiscoveryRepository,
  createTrafficRepository,
  createAdPlacementRepository,
  createFollowRepository,
  createProfileRepository,
  createRequirementRepository,
  createSocialConnectionRepository,
  createUserRepository,
  createWatchlistRepository,
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
  traffic: createTrafficRepository(),
  profiles: createProfileRepository(),
  follows: createFollowRepository(),
  watchlist: createWatchlistRepository(),
  ads: createAdPlacementRepository(),
  comments: createCommentRepository(),
  categories: createCategoryRepository(),
  profileLinks: createProfileLinkRepository(),
  profileIdentity: createProfileIdentityRepository(),
  businesses: createBusinessRepository(),
  requirements: createRequirementRepository(),
  collabs: createCollabRepository(),
  connections: createConnectionRepository(),
  socialConnections: createSocialConnectionRepository(),
  managers: createManagerRepository(),
  users: createUserRepository(),
  settings: createAppSettingsRepository(),
};

export const clock = systemClock;

/** Sponsored placements (ADR-0020) — admin-placed, gated on the `ads` flag. */
export const adPlacementDeps = {
  ads: repositories.ads,
  settings: repositories.settings,
  now: clock.now,
};

/** Service-dependency bundles — shapes defined once in @plugfolio/core (§6). */
export const businessCollabDeps = makeBusinessCollabDeps(repositories, clock.now);

export const profileLinkDeps = makeProfileLinkDeps({
  profiles: repositories.profiles,
  profileLinks: repositories.profileLinks,
});

export const profileIdentityDeps = makeProfileIdentityDeps({
  profiles: repositories.profiles,
  identity: repositories.profileIdentity,
});

export const youtubeDeps = {
  connections: repositories.socialConnections,
  youtube: createYouTubeGateway(),
  now: clock.now,
};

export const profileManagerDeps = makeProfileManagerDeps({
  profiles: repositories.profiles,
  managers: repositories.managers,
  users: repositories.users,
});
