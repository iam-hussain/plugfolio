import { z } from "zod";
import { ConflictError, ForbiddenError } from "../errors";
import type { ManagerRepository, ManagerView, UserRepository } from "../ports/manager-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import { sendSetPasswordLink, type AccountAuthDeps } from "./account-auth";

/**
 * Manager administration (ADR-0004): every profile has exactly one Admin (the
 * owning user) and up to 3 Managers. Only the Admin touches this surface —
 * Managers see every tab EXCEPT settings and connections.
 */
export type ProfileManagerDeps = {
  profiles: ProfileRepository;
  managers: ManagerRepository;
  users: UserRepository;
};

export const MAX_MANAGERS_PER_PROFILE = 3;

export const inviteManagerInput = z.object({
  profileId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email(),
});

export type InviteManagerInput = z.infer<typeof inviteManagerInput>;

/** Asserts the caller Admins the profile and returns it (so the invite email
 * can name the profile the invitee is being handed). */
async function requireOwnedProfile(
  deps: Pick<ProfileManagerDeps, "profiles">,
  userId: string,
  profileId: string,
) {
  const owned = await deps.profiles.listByUser(userId);
  const profile = owned.find((p) => p.id === profileId);
  if (!profile) throw new ForbiddenError("Only the profile Admin can manage access");
  return profile;
}

async function requireAdmin(
  deps: Pick<ProfileManagerDeps, "profiles">,
  userId: string,
  profileId: string,
): Promise<void> {
  await requireOwnedProfile(deps, userId, profileId);
}

export async function inviteManager(
  deps: ProfileManagerDeps & { auth: AccountAuthDeps },
  userId: string,
  input: InviteManagerInput,
): Promise<void> {
  const profile = await requireOwnedProfile(deps, userId, input.profileId);
  if ((await deps.managers.count(input.profileId)) >= MAX_MANAGERS_PER_PROFILE) {
    throw new ConflictError(`A profile has at most ${MAX_MANAGERS_PER_PROFILE} Managers`);
  }
  const invitee = await deps.users.findOrCreateByEmail(input.email);
  if (invitee.id === userId) {
    throw new ConflictError("You are the Admin of this profile");
  }
  await deps.managers.add(input.profileId, invitee.id);
  // Brief 04 edge: an invitee with no password yet gets a set-password link —
  // the /reset screen doubles as their first-password screen, and consuming
  // it marks the email verified (ADR-0012). It rides the distinct
  // Manager-invite email, which leads with WHO invited them and WHICH profile.
  if (invitee.passwordless) {
    const inviterHandle = await deps.users.getHandle(userId);
    await sendSetPasswordLink(deps.auth, input.email, {
      inviterName: inviterHandle ?? "A Plugfolio creator",
      profileHandle: profile.username,
    });
  }
}

export async function removeManager(
  deps: ProfileManagerDeps,
  userId: string,
  profileId: string,
  managerUserId: string,
): Promise<void> {
  await requireAdmin(deps, userId, profileId);
  await deps.managers.remove(profileId, managerUserId);
}

export async function listManagers(
  deps: ProfileManagerDeps,
  userId: string,
  profileId: string,
): Promise<readonly ManagerView[]> {
  await requireAdmin(deps, userId, profileId);
  return deps.managers.list(profileId);
}
