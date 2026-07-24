import { ConflictError, NotFoundError } from "../errors";
import type {
  AdminAuditRepository,
  AdminProfileDetail,
  AdminProfileRepository,
  AdminProfileRow,
  AppSettingsRepository,
  Page,
  PageQuery,
  ProfileStatusFilter,
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

const DAY_MS = 24 * 60 * 60 * 1000;

export async function searchProfiles(
  deps: Pick<AdminProfilesDeps, "profiles">,
  query: string | undefined,
  status: ProfileStatusFilter | undefined,
  page: PageQuery,
): Promise<Page<AdminProfileRow>> {
  return deps.profiles.search(query?.trim() || undefined, status, page);
}

export async function getProfileDetail(
  deps: Pick<AdminProfilesDeps, "profiles" | "now">,
  profileId: string,
): Promise<AdminProfileDetail> {
  const detail = await deps.profiles.detail(
    profileId,
    new Date(deps.now().getTime() - 30 * DAY_MS),
  );
  if (!detail) throw new NotFoundError("No such profile");
  return detail;
}

export async function suspendProfile(
  deps: AdminProfilesDeps,
  adminId: string,
  profileId: string,
  reason: string,
): Promise<void> {
  if ((await deps.profiles.setSuspended(profileId, deps.now())) === "not_found") {
    throw new NotFoundError("No such profile");
  }
  await deps.audit.record({
    adminId,
    action: "profile.suspend",
    targetType: "profile",
    targetId: profileId,
    detail: reason,
  });
}

export async function unsuspendProfile(
  deps: AdminProfilesDeps,
  adminId: string,
  profileId: string,
): Promise<void> {
  if ((await deps.profiles.setSuspended(profileId, null)) === "not_found") {
    throw new NotFoundError("No such profile");
  }
  await deps.audit.record({
    adminId,
    action: "profile.unsuspend",
    targetType: "profile",
    targetId: profileId,
  });
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
