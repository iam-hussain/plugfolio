import {
  createAdminAnalyticsRepository,
  createAdminAuditRepository,
  createAdminBusinessRepository,
  createAdminCollabRepository,
  createAdminContentRepository,
  createAdminMemberRepository,
  createAdminOverviewRepository,
  createAdminProfileRepository,
  createAdminRequirementRepository,
  createAdminUserRepository,
  createAppSettingsRepository,
} from "@plugfolio/db";

/**
 * Composition root (§6): the admin app wires core services to Prisma
 * repositories here. Per ADR-0014 it talks to the database directly —
 * no admin endpoints in apps/api.
 */
export const repositories = {
  admins: createAdminUserRepository(),
  audit: createAdminAuditRepository(),
  settings: createAppSettingsRepository(),
  members: createAdminMemberRepository(),
  profiles: createAdminProfileRepository(),
  content: createAdminContentRepository(),
  businesses: createAdminBusinessRepository(),
  requirements: createAdminRequirementRepository(),
  collabs: createAdminCollabRepository(),
  analytics: createAdminAnalyticsRepository(),
  overview: createAdminOverviewRepository(),
};

export const clock = { now: () => new Date() };

/** The member-moderation dependency bundle, wired once. */
export const adminMembersDeps = {
  members: repositories.members,
  audit: repositories.audit,
  now: clock.now,
};

/** The app-settings dependency bundle (reserved usernames, feature flags). */
export const appSettingsDeps = {
  settings: repositories.settings,
  audit: repositories.audit,
};

/** Profile moderation: suspend a page, release a username. */
export const adminProfilesDeps = {
  profiles: repositories.profiles,
  audit: repositories.audit,
  now: clock.now,
};

/** Content takedowns: comments, posts, products. */
export const adminContentDeps = {
  content: repositories.content,
  audit: repositories.audit,
};

/** Marketplace oversight: business logo strip, scam-brief removal. */
export const adminOversightDeps = {
  businesses: repositories.businesses,
  requirements: repositories.requirements,
  audit: repositories.audit,
};
