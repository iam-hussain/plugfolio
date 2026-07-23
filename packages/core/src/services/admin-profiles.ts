import { ConflictError, NotFoundError } from "../errors";
import type {
  AdminAuditRepository,
  AdminProfileRepository,
  AdminProfileRow,
  AppSettingsRepository,
} from "../ports/admin-repository";
import type { ReleaseUsernameInput } from "../schemas/admin";
import { isUsernameReserved } from "./app-settings";

/**
 * Profile moderation (docs/implementation/admin-app.md): suspend takes ONE
 * page off the public surface (owner still signs in — member suspension is
 * the account-wide lever), and username release settles the "first verified
 * owner keeps it" disputes by dropping a page back to a random username.
 */

export type AdminProfilesDeps = {
  profiles: AdminProfileRepository;
  audit: AdminAuditRepository;
  settings: AppSettingsRepository;
  now: () => Date;
};

const SEARCH_LIMIT = 50;

export async function searchProfiles(
  deps: Pick<AdminProfilesDeps, "profiles">,
  query?: string,
): Promise<readonly AdminProfileRow[]> {
  return deps.profiles.search(query?.trim() || undefined, SEARCH_LIMIT);
}

async function setProfileSuspension(
  deps: AdminProfilesDeps,
  adminId: string,
  profileId: string,
  at: Date | null,
): Promise<void> {
  if ((await deps.profiles.setSuspended(profileId, at)) === "not_found") {
    throw new NotFoundError("No such profile");
  }
  await deps.audit.record({
    adminId,
    action: at ? "profile.suspend" : "profile.unsuspend",
    targetType: "profile",
    targetId: profileId,
  });
}

export async function suspendProfile(
  deps: AdminProfilesDeps,
  adminId: string,
  profileId: string,
): Promise<void> {
  await setProfileSuspension(deps, adminId, profileId, deps.now());
}

export async function unsuspendProfile(
  deps: AdminProfilesDeps,
  adminId: string,
  profileId: string,
): Promise<void> {
  await setProfileSuspension(deps, adminId, profileId, null);
}

/**
 * Frees the profile's current username (claimable again the moment this
 * returns) and moves the page to the admin-chosen replacement — usually the
 * suggested random `creator-…`, but any valid, unreserved, untaken name.
 */
export async function releaseProfileUsername(
  deps: AdminProfilesDeps,
  adminId: string,
  input: ReleaseUsernameInput,
): Promise<string> {
  const { profileId, username } = input;
  if (await isUsernameReserved({ settings: deps.settings }, username)) {
    throw new ConflictError("That username is reserved");
  }
  const result = await deps.profiles.setUsername(profileId, username);
  if (result === "not_found") throw new NotFoundError("No such profile");
  if (result === "taken") throw new ConflictError("That username is already taken");
  await deps.audit.record({
    adminId,
    action: "profile.releaseUsername",
    targetType: "profile",
    targetId: profileId,
    detail: `${result.previous} → ${username}`,
  });
  return username;
}
