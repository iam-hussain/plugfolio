import type { AuthMailer } from "@plugfolio/core";
import {
  createAppSettingsRepository,
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
  createProfileLinkRepository,
  createProfileRepository,
  createRequirementRepository,
  createSessionRepository,
  createTapRepository,
  createUserRepository,
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
  codeCopies: createCodeCopyRepository(),
  products: createProductRepository(),
  profiles: createProfileRepository(),
  follows: createFollowRepository(),
  comments: createCommentRepository(),
  categories: createCategoryRepository(),
  profileLinks: createProfileLinkRepository(),
  businesses: createBusinessRepository(),
  requirements: createRequirementRepository(),
  collabs: createCollabRepository(),
  sessions: createSessionRepository(),
  connections: createConnectionRepository(),
  managers: createManagerRepository(),
  users: createUserRepository(),
  settings: createAppSettingsRepository(),
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

// ponytail: no mail transport yet — links go to the server console; a real
// provider (SMTP/Resend) replaces this object at deployment time.
const consoleMailer: AuthMailer = {
  async sendVerification(email, url) {
    console.log(`[auth] verification link for ${email}: ${url}`);
  },
  async sendPasswordReset(email, url) {
    console.log(`[auth] password-reset link for ${email}: ${url}`);
  },
};

export const accountAuthDeps = {
  accounts: createAuthAccountRepository(),
  tokens: createAuthTokenRepository(),
  mailer: consoleMailer,
  webOrigin: env.WEB_ORIGIN,
  now: clock.now,
};
