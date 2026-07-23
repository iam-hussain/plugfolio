import { NotFoundError } from "../errors";
import type {
  AdminAuditRepository,
  AdminMemberRepository,
  AdminMemberRow,
} from "../ports/admin-repository";

/**
 * Member moderation (docs/implementation/admin-app.md). Suspension blocks
 * login (account-auth) and darkens every profile the account owns (public
 * reads filter on it) — data is never deleted, so lifting it restores all.
 */

export type AdminMembersDeps = {
  members: AdminMemberRepository;
  audit: AdminAuditRepository;
  now: () => Date;
};

const SEARCH_LIMIT = 50;

export async function searchMembers(
  deps: Pick<AdminMembersDeps, "members">,
  query?: string,
): Promise<readonly AdminMemberRow[]> {
  return deps.members.search(query?.trim() || undefined, SEARCH_LIMIT);
}

async function setMemberSuspension(
  deps: AdminMembersDeps,
  adminId: string,
  userId: string,
  at: Date | null,
): Promise<void> {
  if ((await deps.members.setSuspended(userId, at)) === "not_found") {
    throw new NotFoundError("No such member");
  }
  await deps.audit.record({
    adminId,
    action: at ? "member.suspend" : "member.unsuspend",
    targetType: "user",
    targetId: userId,
  });
}

export async function suspendMember(
  deps: AdminMembersDeps,
  adminId: string,
  userId: string,
): Promise<void> {
  await setMemberSuspension(deps, adminId, userId, deps.now());
}

export async function unsuspendMember(
  deps: AdminMembersDeps,
  adminId: string,
  userId: string,
): Promise<void> {
  await setMemberSuspension(deps, adminId, userId, null);
}
