import { ConflictError, NotFoundError } from "../errors";
import type {
  AdminAuditRepository,
  AdminMemberDetail,
  AdminMemberRepository,
  AdminMemberRow,
  AppSettingsRepository,
  MemberStatusFilter,
  Page,
  PageQuery,
} from "../ports/admin-repository";
import type { UserRepository } from "../ports/manager-repository";
import { isUsernameReserved } from "./app-settings";

/**
 * Member moderation (docs/implementation/admin-app.md). Suspension blocks
 * login (account-auth) and darkens every profile the account owns (public
 * reads filter on it) — reversible, nothing deleted. Account deletion is the
 * one true cascade, guarded by type-to-confirm in the UI. Every mutation
 * carries a required reason or a DB-sourced detail into the audit log.
 */

export type AdminMembersDeps = {
  members: AdminMemberRepository;
  audit: AdminAuditRepository;
  now: () => Date;
};

export async function searchMembers(
  deps: Pick<AdminMembersDeps, "members">,
  query: string | undefined,
  status: MemberStatusFilter | undefined,
  page: PageQuery,
): Promise<Page<AdminMemberRow>> {
  return deps.members.search(query?.trim() || undefined, status, page);
}

export async function getMemberDetail(
  deps: Pick<AdminMembersDeps, "members">,
  userId: string,
): Promise<AdminMemberDetail> {
  const detail = await deps.members.detail(userId);
  if (!detail) throw new NotFoundError("No such member");
  return detail;
}

export async function suspendMember(
  deps: AdminMembersDeps,
  adminId: string,
  userId: string,
  reason: string,
): Promise<void> {
  if ((await deps.members.setSuspended(userId, deps.now())) === "not_found") {
    throw new NotFoundError("No such member");
  }
  await deps.audit.record({
    adminId,
    action: "member.suspend",
    targetType: "user",
    targetId: userId,
    detail: reason,
  });
}

export async function unsuspendMember(
  deps: AdminMembersDeps,
  adminId: string,
  userId: string,
): Promise<void> {
  if ((await deps.members.setSuspended(userId, null)) === "not_found") {
    throw new NotFoundError("No such member");
  }
  await deps.audit.record({
    adminId,
    action: "member.unsuspend",
    targetType: "user",
    targetId: userId,
  });
}

/** Bulk sweep — one audit entry naming the count and the shared reason. */
export async function suspendMembersBulk(
  deps: AdminMembersDeps,
  adminId: string,
  userIds: readonly string[],
  reason: string,
): Promise<number> {
  const count = await deps.members.setSuspendedBulk(userIds, deps.now());
  await deps.audit.record({
    adminId,
    action: "member.bulkSuspend",
    targetType: "user",
    detail: `${count} members — ${reason}`,
  });
  return count;
}

/** The heaviest verb in the console — full cascade, type-to-confirm gated. */
export async function deleteMemberAccount(
  deps: AdminMembersDeps,
  adminId: string,
  userId: string,
): Promise<void> {
  const removed = await deps.members.remove(userId);
  if (removed === "not_found") throw new NotFoundError("No such member");
  await deps.audit.record({
    adminId,
    action: "member.delete",
    targetType: "user",
    targetId: userId,
    detail: removed.email,
  });
}

export type AdminResetHandleDeps = AdminMembersDeps & {
  users: UserRepository;
  settings: AppSettingsRepository;
};

/** Frees an @handle grabbed before it was reserved (admin-console-m2 §2.3). */
export async function resetMemberHandle(
  deps: AdminResetHandleDeps,
  adminId: string,
  userId: string,
  newHandle: string,
): Promise<void> {
  if (await isUsernameReserved({ settings: deps.settings }, newHandle)) {
    throw new ConflictError("That handle is reserved");
  }
  const previous = (await deps.users.getHandle(userId)) ?? "?";
  if ((await deps.users.updateUsername(userId, newHandle)) === "taken") {
    throw new ConflictError("That handle is already taken");
  }
  await deps.audit.record({
    adminId,
    action: "member.resetHandle",
    targetType: "user",
    targetId: userId,
    detail: `@${previous} → @${newHandle}`,
  });
}
