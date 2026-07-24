import { ForbiddenError, NotFoundError } from "../errors";
import type {
  ProfileIdentity,
  ProfileIdentityRepository,
} from "../ports/profile-identity-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import type { UpdateProfileIdentityInput } from "../schemas/profile-identity";

/**
 * Profile Settings use-cases (brief 10, ADR-0004): the Admin edits the whole
 * public identity and can delete the profile (freeing a slot); a Manager can
 * change ONLY the picture — the one Settings control they get.
 */
export type ProfileIdentityDeps = {
  profiles: ProfileRepository;
  identity: ProfileIdentityRepository;
};

async function roleOn(
  deps: Pick<ProfileIdentityDeps, "profiles">,
  userId: string,
  profileId: string,
): Promise<"admin" | "manager"> {
  const profiles = await deps.profiles.listAccessibleByUser(userId);
  const membership = profiles.find((profile) => profile.id === profileId);
  if (!membership) throw new ForbiddenError("Not your profile");
  return membership.role;
}

export async function getMyProfileIdentity(
  deps: ProfileIdentityDeps,
  userId: string,
  profileId: string,
): Promise<ProfileIdentity & { role: "admin" | "manager" }> {
  const role = await roleOn(deps, userId, profileId);
  const identity = await deps.identity.get(profileId);
  if (!identity) throw new NotFoundError("Profile not found");
  return { ...identity, role };
}

export async function updateProfileIdentity(
  deps: ProfileIdentityDeps,
  userId: string,
  input: UpdateProfileIdentityInput,
): Promise<void> {
  const role = await roleOn(deps, userId, input.profileId);
  const patch: { -readonly [K in keyof ProfileIdentity]?: ProfileIdentity[K] } = {};
  if (input.displayName !== undefined) patch.displayName = input.displayName;
  if (input.avatarUrl !== undefined) patch.avatarUrl = input.avatarUrl;
  if (input.bio !== undefined) patch.bio = input.bio;
  // Brief 10: the picture is the ONE control a Manager gets.
  const touchesMoreThanPicture = patch.displayName !== undefined || patch.bio !== undefined;
  if (role !== "admin" && touchesMoreThanPicture) {
    throw new ForbiddenError("Only the profile's Admin can edit its name or bio");
  }
  if (Object.keys(patch).length === 0) return;
  await deps.identity.update(input.profileId, patch);
}

/** Destructive, Admin-only: frees a profile slot; content cascades away. */
export async function deleteProfile(
  deps: ProfileIdentityDeps,
  userId: string,
  profileId: string,
): Promise<void> {
  const role = await roleOn(deps, userId, profileId);
  if (role !== "admin") throw new ForbiddenError("Only the profile's Admin can delete it");
  await deps.identity.delete(profileId);
}
