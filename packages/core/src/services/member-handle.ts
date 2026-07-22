import { randomUUID } from "node:crypto";
import { ConflictError } from "../errors";
import type { UserRepository } from "../ports/manager-repository";
import type { UpdateMemberHandleInput } from "../schemas/member-handle";

/**
 * The member handle (ADR-0009): auto-generated at first sign-in so sign-up
 * stays one step, changeable here. Public identity only — never a login.
 */

// ponytail: minimal reserved list; grow it when real collisions with product
// surfaces appear.
const RESERVED_HANDLES = new Set(["admin", "api", "plugfolio", "support", "help"]);

/** Used wherever a User row is created (auth adapter, manager invites). */
export function generateMemberHandle(): string {
  return `user-${randomUUID().slice(0, 8)}`;
}

export type MemberHandleDeps = {
  users: UserRepository;
};

export async function updateMemberHandle(
  deps: MemberHandleDeps,
  userId: string,
  input: UpdateMemberHandleInput,
): Promise<void> {
  if (RESERVED_HANDLES.has(input.username)) {
    throw new ConflictError("That handle is reserved");
  }
  if ((await deps.users.updateUsername(userId, input.username)) === "taken") {
    throw new ConflictError("That handle is taken");
  }
}

export async function getMemberHandle(deps: MemberHandleDeps, userId: string): Promise<string> {
  return (await deps.users.getHandle(userId)) ?? "";
}
