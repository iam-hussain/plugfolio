import { selectAuthMailer, systemClock, type AuthMailer } from "@plugfolio/core";
import {
  createAdminAnalyticsRepository,
  createAdminAuditRepository,
  createAdminBusinessRepository,
  createAdminCollabRepository,
  createAdminContentRepository,
  createAdminMemberRepository,
  createAdminOverviewRepository,
  createAdminProfileRepository,
  createAdminReportRepository,
  createAdminRequirementRepository,
  createAdminSupportRepository,
  createAdminUserRepository,
  createAdPlacementRepository,
  createAppSettingsRepository,
  createAuthAccountRepository,
  createAuthTokenRepository,
  createUserRepository,
} from "@plugfolio/db";
import { env } from "@/env";

/**
 * Composition root (§6): the admin app wires core services to Prisma
 * repositories here. Per ADR-0014 it talks to the database directly —
 * no admin endpoints in apps/api.
 */
export const repositories = {
  admins: createAdminUserRepository(),
  audit: createAdminAuditRepository(),
  settings: createAppSettingsRepository(),
  ads: createAdPlacementRepository(),
  members: createAdminMemberRepository(),
  profiles: createAdminProfileRepository(),
  content: createAdminContentRepository(),
  businesses: createAdminBusinessRepository(),
  requirements: createAdminRequirementRepository(),
  collabs: createAdminCollabRepository(),
  reports: createAdminReportRepository(),
  support: createAdminSupportRepository(),
  analytics: createAdminAnalyticsRepository(),
  overview: createAdminOverviewRepository(),
  // Product-side seams the member email actions ride on (ADR-0012 machinery).
  accounts: createAuthAccountRepository(),
  tokens: createAuthTokenRepository(),
  users: createUserRepository(),
};

export const clock = systemClock;

const consoleMailer: AuthMailer = {
  async sendVerification(email, url) {
    console.log(`[admin mailer] verification for ${email}: ${url}`);
  },
  async sendPasswordReset(email, url) {
    console.log(`[admin mailer] password link for ${email}: ${url}`);
  },
  async sendManagerInvite(email, url, context) {
    console.log(
      `[admin mailer] manager invite for ${email} (from ${context.inviterName} on @${context.profileHandle}): ${url}`,
    );
  },
};

/** Real transport when configured (ADR-0015); console fallback in dev. */
export const mailer: AuthMailer = selectAuthMailer(
  {
    from: env.EMAIL_FROM,
    apiKeySid: env.TWILIO_API_KEY_SID,
    apiKeySecret: env.TWILIO_API_KEY_SECRET,
  },
  consoleMailer,
);

/** The member-moderation dependency bundle, wired once. */
export const adminMembersDeps = {
  members: repositories.members,
  audit: repositories.audit,
  now: clock.now,
};

/** Handle reset needs the product user repo + reserved-name settings too. */
export const adminResetHandleDeps = {
  ...adminMembersDeps,
  users: repositories.users,
  settings: repositories.settings,
};

/** Sponsored placements (ADR-0020) — operator-placed, gated on the `ads` flag. */
export const adPlacementDeps = {
  ads: repositories.ads,
  settings: repositories.settings,
  now: () => new Date(),
};

/** Member email sends (resend verification / password reset) — product-auth
 * machinery pointed at the WEB origin, where the links land. */
export const memberEmailDeps = {
  accounts: repositories.accounts,
  tokens: repositories.tokens,
  mailer,
  webOrigin: env.WEB_ORIGIN,
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
  settings: repositories.settings,
  now: clock.now,
};

/** Content takedowns: comments, posts, products. */
export const adminContentDeps = {
  content: repositories.content,
  audit: repositories.audit,
  now: clock.now,
};

/** Marketplace oversight: business logo strip, scam-brief removal. */
export const adminOversightDeps = {
  businesses: repositories.businesses,
  requirements: repositories.requirements,
  audit: repositories.audit,
};

/** Collab thread reading + message-level moderation. */
export const adminCollabsDeps = {
  collabs: repositories.collabs,
  audit: repositories.audit,
};

/** The reports triage queue. */
export const adminReportsDeps = {
  reports: repositories.reports,
  audit: repositories.audit,
  now: clock.now,
};

/** The support-tickets queue. */
export const adminSupportDeps = {
  support: repositories.support,
  audit: repositories.audit,
  now: clock.now,
};

/** Operator management (invites ride the admin origin's /set-password). */
export const adminOperatorsDeps = {
  admins: repositories.admins,
  audit: repositories.audit,
  tokens: repositories.tokens,
  mailer,
  adminOrigin: env.ADMIN_ORIGIN,
  now: clock.now,
};
