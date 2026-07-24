"use server";

import {
  ConflictError,
  NotFoundError,
  releaseProfileUsername,
  releaseUsernameInput,
  suspendProfile,
  unsuspendProfile,
} from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminProfilesDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

const profileId = z.string().uuid();
const reason = z.string().trim().min(1);

function fail(error: unknown): ActionResult {
  if (error instanceof NotFoundError || error instanceof ConflictError) {
    return { ok: false, error: error.message };
  }
  throw error;
}

export async function suspendProfileAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsedReason = reason.safeParse(formData.get("reason"));
  if (!parsedReason.success) return { ok: false, error: "A reason is required" };
  try {
    await suspendProfile(
      adminProfilesDeps,
      admin.id,
      profileId.parse(formData.get("profileId")),
      parsedReason.data,
    );
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/profiles");
  return { ok: true };
}

export async function unsuspendProfileAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await unsuspendProfile(adminProfilesDeps, admin.id, profileId.parse(formData.get("profileId")));
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/profiles");
  return { ok: true };
}

export async function releaseUsernameAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = releaseUsernameInput.safeParse({
    profileId: formData.get("profileId"),
    username: formData.get("username"),
  });
  if (!parsed.success) {
    return { ok: false, error: "3–30 characters: lowercase letters, numbers, dots, dashes" };
  }
  try {
    await releaseProfileUsername(adminProfilesDeps, admin.id, parsed.data);
  } catch (error) {
    if (error instanceof ConflictError) {
      return { ok: false, error: `Username not released — ${error.message.toLowerCase()}` };
    }
    return fail(error);
  }
  revalidatePath("/profiles");
  return { ok: true };
}
