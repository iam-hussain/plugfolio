import {
  createAdminAuditRepository,
  createAdminMemberRepository,
  createAdminOverviewRepository,
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
