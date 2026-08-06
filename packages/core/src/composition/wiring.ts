/**
 * Composition helpers shared by every app's composition root (§6). An app's
 * `server/container.ts` builds concrete Prisma repositories, then hands them to
 * these framework-free factories to assemble the typed service-dependency
 * bundles — so the *shape* of each bundle (which repositories a use-case needs)
 * lives in one place instead of being re-declared per deployable.
 */
import { createTwilioMailer } from "../adapters/twilio-mailer";
import type { AuthMailer } from "../ports/auth-account-repository";
import type { BusinessCollabDeps } from "../services/business-collab";
import type { ProfileIdentityDeps } from "../services/profile-identity";
import type { ProfileLinkDeps } from "../services/profile-links";
import type { ProfileManagerDeps } from "../services/profile-managers";

/** The one wall clock every time-stamping service reads. */
export const systemClock: { now: () => Date } = { now: () => new Date() };

/** Business-side collab use-cases (create business, post requirement, bargain). */
export function makeBusinessCollabDeps(
  repos: Omit<BusinessCollabDeps, "now">,
  now: () => Date = systemClock.now,
): BusinessCollabDeps {
  return {
    businesses: repos.businesses,
    requirements: repos.requirements,
    collabs: repos.collabs,
    profiles: repos.profiles,
    now,
  };
}

/** "Your links" — replace-all social links on a profile (Admin-only). */
export function makeProfileLinkDeps(repos: ProfileLinkDeps): ProfileLinkDeps {
  return { profiles: repos.profiles, profileLinks: repos.profileLinks };
}

/** Public profile identity: edit, delete, release the username (Admin-only). */
export function makeProfileIdentityDeps(repos: ProfileIdentityDeps): ProfileIdentityDeps {
  return { profiles: repos.profiles, identity: repos.identity };
}

/** Profile managers: invite, remove (Admin-only settings surface, ADR-0004). */
export function makeProfileManagerDeps(repos: ProfileManagerDeps): ProfileManagerDeps {
  return { profiles: repos.profiles, managers: repos.managers, users: repos.users };
}

/**
 * Pick the mail transport (ADR-0015): the real Twilio sender when a from-address
 * and API key are configured, otherwise the caller's dev/console fallback. The
 * branch is identical across the API and admin apps, so it lives here.
 */
export function selectAuthMailer(
  config: { from?: string; apiKeySid?: string; apiKeySecret?: string },
  fallback: AuthMailer,
): AuthMailer {
  if (!config.from) return fallback;
  if (config.apiKeySid && config.apiKeySecret) {
    return createTwilioMailer({
      apiKeySid: config.apiKeySid,
      apiKeySecret: config.apiKeySecret,
      from: config.from,
    });
  }
  return fallback;
}
