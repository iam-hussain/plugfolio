"use server";

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  changeOwnPassword,
  inviteOperator,
  removeOperator,
  sendOperatorPasswordReset,
} from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminOperatorsDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

function fail(error: unknown): ActionResult {
  if (
    error instanceof NotFoundError ||
    error instanceof ConflictError ||
    error instanceof ForbiddenError ||
    error instanceof UnauthorizedError
  ) {
    return { ok: false, error: error.message };
  }
  throw error;
}

export async function inviteOperatorAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z
    .object({ email: z.string().email(), name: z.string().trim().max(80) })
    .safeParse({ email: formData.get("email"), name: formData.get("name") ?? "" });
  if (!parsed.success) return { ok: false, error: "A valid email is required" };
  try {
    await inviteOperator(adminOperatorsDeps, admin.id, {
      email: parsed.data.email,
      name: parsed.data.name || null,
    });
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/admins");
  return { ok: true };
}

export async function removeOperatorAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await removeOperator(
      adminOperatorsDeps,
      admin.id,
      z.string().uuid().parse(formData.get("adminId")),
    );
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/admins");
  return { ok: true };
}

export async function sendOperatorResetAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await sendOperatorPasswordReset(
      adminOperatorsDeps,
      admin.id,
      z.string().email().parse(formData.get("email")),
    );
  } catch (error) {
    return fail(error);
  }
  return { ok: true };
}

export async function changeOwnPasswordAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(10, "New password must be at least 10 characters"),
    })
    .safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
    });
  if (!parsed.success) {
    return { ok: false, error: "New password must be at least 10 characters" };
  }
  try {
    await changeOwnPassword(adminOperatorsDeps, { id: admin.id, email: admin.email }, parsed.data);
  } catch (error) {
    return fail(error);
  }
  return { ok: true };
}
