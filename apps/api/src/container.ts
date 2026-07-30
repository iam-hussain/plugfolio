import { createResendMailer, type AuthMailer } from "@plugfolio/core";
import {
  createAppSettingsRepository,
  createReportWriteRepository,
  createSupportTicketWriteRepository,
  createAuthAccountRepository,
  createAuthTokenRepository,
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
  createProfileIdentityRepository,
  createProfileLinkRepository,
  createProfileRepository,
  createRequirementRepository,
  createSessionRepository,
  createTapRepository,
  createUserRepository,
  createViewRepository,
  createViewTargetRepository,
} from "@plugfolio/db";
import { createOgMetadataGateway } from "./gateways/og-metadata";
import { env } from "./env";

/**
 * Composition root: the API wires domain services to their concrete Prisma
 * repositories here (§6 layering) — the same seam apps/web has for its
 * server-rendered reads.
 */
export const repositories = {
  taps: createTapRepository(),
  views: createViewRepository(),
  viewTargets: createViewTargetRepository(),
  codeCopies: createCodeCopyRepository(),
  products: createProductRepository(),
  profiles: createProfileRepository(),
  follows: createFollowRepository(),
  comments: createCommentRepository(),
  categories: createCategoryRepository(),
  profileLinks: createProfileLinkRepository(),
  profileIdentity: createProfileIdentityRepository(),
  businesses: createBusinessRepository(),
  requirements: createRequirementRepository(),
  collabs: createCollabRepository(),
  sessions: createSessionRepository(),
  connections: createConnectionRepository(),
  managers: createManagerRepository(),
  users: createUserRepository(),
  settings: createAppSettingsRepository(),
  reportWrites: createReportWriteRepository(),
  supportWrites: createSupportTicketWriteRepository(),
  postWrites: createPostWriteRepository(),
  productWrites: createProductWriteRepository(),
};

export const clock = { now: () => new Date() };

export const shopperSocialDeps = {
  follows: repositories.follows,
  comments: repositories.comments,
  profiles: repositories.profiles,
  products: repositories.products,
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

export const profileLinkDeps = {
  profiles: repositories.profiles,
  profileLinks: repositories.profileLinks,
};

export const profileIdentityDeps = {
  profiles: repositories.profiles,
  identity: repositories.profileIdentity,
};

const consoleMailer: AuthMailer = {
  async sendVerification(email, url) {
    console.log(`[auth] verification link for ${email}: ${url}`);
  },
  async sendPasswordReset(email, url) {
    console.log(`[auth] password-reset link for ${email}: ${url}`);
  },
  async sendManagerInvite(email, url, context) {
    console.log(
      `[auth] manager invite for ${email} (from ${context.inviterName} on @${context.profileHandle}): ${url}`,
    );
  },
};

// Real transport when configured (ADR-0015); links log to the console in dev.
export const mailer: AuthMailer =
  env.RESEND_API_KEY && env.EMAIL_FROM
    ? createResendMailer({ apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM })
    : consoleMailer;

export const accountAuthDeps = {
  accounts: createAuthAccountRepository(),
  tokens: createAuthTokenRepository(),
  mailer,
  webOrigin: env.WEB_ORIGIN,
  now: clock.now,
};
