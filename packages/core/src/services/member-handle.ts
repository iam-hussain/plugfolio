import { randomUUID } from "node:crypto";
import { ConflictError } from "../errors";
import type { AppSettingsRepository } from "../ports/admin-repository";
import type { UserRepository } from "../ports/manager-repository";
import type { UpdateMemberHandleInput } from "../schemas/member-handle";
import { isUsernameReserved } from "./app-settings";

/**
 * The member handle (ADR-0009): auto-generated at first sign-in so sign-up
 * stays one step, changeable here. Public identity only — never a login.
 * Reserved names = the baseline route/brand list plus the admin-managed
 * additions in app settings (docs/implementation/admin-app.md).
 */

/** Used wherever a User row is created (auth adapter, manager invites). */
export function generateMemberHandle(): string {
  return `user-${randomUUID().slice(0, 8)}`;
}

export type MemberHandleDeps = {
  users: UserRepository;
  settings: AppSettingsRepository;
};

export async function updateMemberHandle(
  deps: MemberHandleDeps,
  userId: string,
  input: UpdateMemberHandleInput,
): Promise<void> {
  if (await isUsernameReserved({ settings: deps.settings }, input.username)) {
    throw new ConflictError("That handle is reserved");
  }
  if ((await deps.users.updateUsername(userId, input.username)) === "taken") {
    throw new ConflictError("That handle is taken");
  }
}

export async function getMemberHandle(
  deps: Pick<MemberHandleDeps, "users">,
  userId: string,
): Promise<string> {
  return (await deps.users.getHandle(userId)) ?? "";
}
