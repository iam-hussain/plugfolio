"use server";

import {
  ConflictError,
  NotFoundError,
  deleteMemberAccount,
  requestPasswordReset,
  resendVerification,
  resetMemberHandle,
  suspendMember,
  suspendMembersBulk,
  unsuspendMember,
  updateMemberHandleInput,
} from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import {
  adminMembersDeps,
  adminResetHandleDeps,
  memberEmailDeps,
} from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

const userId = z.string().uuid();
const reason = z.string().trim().min(1, "A reason is required");

/** Maps the known service failures to error toasts; rethrows the rest. */
function fail(error: unknown): ActionResult {
  if (error instanceof NotFoundError || error instanceof ConflictError) {
    return { ok: false, error: error.message };
  }
  throw error;
}

export async function suspendMemberAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsedReason = reason.safeParse(formData.get("reason"));
  if (!parsedReason.success) return { ok: false, error: "A reason is required" };
  try {
    await suspendMember(
      adminMembersDeps,
      admin.id,
      userId.parse(formData.get("userId")),
      parsedReason.data,
    );
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/members");
  return { ok: true };
}

export async function unsuspendMemberAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await unsuspendMember(adminMembersDeps, admin.id, userId.parse(formData.get("userId")));
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/members");
  return { ok: true };
}

export async function bulkSuspendMembersAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsedReason = reason.safeParse(formData.get("reason"));
  if (!parsedReason.success) return { ok: false, error: "A reason is required" };
  const ids = z
    .array(userId)
    .min(1)
    .parse(String(formData.get("ids") ?? "").split(",").filter(Boolean));
  await suspendMembersBulk(adminMembersDeps, admin.id, ids, parsedReason.data);
  revalidatePath("/members");
  return { ok: true };
}

export async function resendMemberVerificationAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const email = z.string().email().parse(formData.get("email"));
  await resendVerification(memberEmailDeps, { email });
  return { ok: true };
}

export async function sendMemberPasswordResetAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const email = z.string().email().parse(formData.get("email"));
  await requestPasswordReset(memberEmailDeps, { email });
  return { ok: true };
}

export async function resetMemberHandleAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = updateMemberHandleInput.safeParse({ username: formData.get("username") });
  if (!parsed.success) {
    return { ok: false, error: "3–30 characters: lowercase letters, numbers, dots, dashes" };
  }
  try {
    await resetMemberHandle(
      adminResetHandleDeps,
      admin.id,
      userId.parse(formData.get("userId")),
      parsed.data.username,
    );
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/members");
  return { ok: true };
}

export async function deleteMemberAccountAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await deleteMemberAccount(adminMembersDeps, admin.id, userId.parse(formData.get("userId")));
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/members");
  return { ok: true };
}
