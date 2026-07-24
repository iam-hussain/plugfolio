import { ForbiddenError } from "../errors";
import type { ProfileLinkRepository, ProfileLinkView } from "../ports/profile-link-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import { SOCIAL_PLATFORM_ORDER, type SetProfileLinksInput } from "../schemas/profile-links";

/**
 * "Your links" use-cases (design-out: the socials row on every creator page,
 * authored in dashboard Settings). Settings are Admin-only (ADR-0004) — a
 * Manager can post and tag but never edits the page's identity.
 */
export type ProfileLinkDeps = {
  profiles: ProfileRepository;
  profileLinks: ProfileLinkRepository;
};

const orderIndex = (platform: ProfileLinkView["platform"]): number =>
  SOCIAL_PLATFORM_ORDER.indexOf(platform);

function sorted(links: readonly ProfileLinkView[]): readonly ProfileLinkView[] {
  return [...links].sort((a, b) => orderIndex(a.platform) - orderIndex(b.platform));
}

async function requireAdminProfile(
  deps: Pick<ProfileLinkDeps, "profiles">,
  userId: string,
  profileId: string,
): Promise<void> {
  const owned = await deps.profiles.listByUser(userId);
  if (!owned.some((profile) => profile.id === profileId)) {
    throw new ForbiddenError("Only the profile's Admin can edit its links");
  }
}

/** Public read — the creator page renders the row for everyone. */
export async function getProfileLinks(
  deps: Pick<ProfileLinkDeps, "profileLinks">,
  profileId: string,
): Promise<readonly ProfileLinkView[]> {
  return sorted(await deps.profileLinks.listByProfile(profileId));
}

/** Admin read for the Settings form (403 for Managers and strangers). */
export async function listMyProfileLinks(
  deps: ProfileLinkDeps,
  userId: string,
  profileId: string,
): Promise<readonly ProfileLinkView[]> {
  await requireAdminProfile(deps, userId, profileId);
  return getProfileLinks(deps, profileId);
}

export async function setProfileLinks(
  deps: ProfileLinkDeps,
  userId: string,
  input: SetProfileLinksInput,
): Promise<void> {
  await requireAdminProfile(deps, userId, input.profileId);
  await deps.profileLinks.replaceAll(input.profileId, input.links);
}
