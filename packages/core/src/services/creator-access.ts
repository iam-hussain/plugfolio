import { ForbiddenError } from "../errors";
import type { ProfileRepository } from "../ports/profile-repository";

/**
 * The shared ownership guard for the creator's back room: posting, tagging and
 * curating shelves are all open to a profile's Admin OR its Managers (ADR-0004)
 * — settings stay Admin-only elsewhere. Both `creator-content` and
 * `creator-categories` gate on this, so it lives on its own.
 */
export async function requireOwnProfile(
  deps: { profiles: ProfileRepository },
  userId: string,
  profileId: string,
): Promise<void> {
  const profiles = await deps.profiles.listAccessibleByUser(userId);
  if (!profiles.some((profile) => profile.id === profileId)) {
    throw new ForbiddenError("Not your profile");
  }
}
