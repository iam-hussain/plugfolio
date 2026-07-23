import { ConflictError, NotFoundError } from "../errors";
import type {
  AdminAuditRepository,
  AdminProfileRepository,
  AdminProfileRow,
} from "../ports/admin-repository";
import { generateProfileUsername } from "./creator-content";

/**
 * Profile moderation (docs/implementation/admin-app.md): suspend takes ONE
 * page off the public surface (owner still signs in — member suspension is
 * the account-wide lever), and username release settles the "first verified
 * owner keeps it" disputes by dropping a page back to a random username.
 */

export type AdminProfilesDeps = {
  profiles: AdminProfileRepository;
  audit: AdminAuditRepository;
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

/** The freed username becomes claimable again the moment this returns. */
export async function releaseProfileUsername(
  deps: AdminProfilesDeps,
  adminId: string,
  profileId: string,
): Promise<string> {
  const username = generateProfileUsername();
  const result = await deps.profiles.setUsername(profileId, username);
  if (result === "not_found") throw new NotFoundError("No such profile");
  // A random-uuid collision — vanishingly rare; the operator just retries.
  if (result === "taken") throw new ConflictError("Name collision — try again");
  await deps.audit.record({
    adminId,
    action: "profile.releaseUsername",
    targetType: "profile",
    targetId: profileId,
    detail: `${result.previous} → ${username}`,
  });
  return username;
}
