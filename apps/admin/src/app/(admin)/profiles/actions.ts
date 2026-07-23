"use server";

import {
  ConflictError,
  releaseProfileUsername,
  releaseUsernameInput,
  suspendProfile,
  unsuspendProfile,
} from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminProfilesDeps } from "@/server/container";

const profileId = z.string().uuid();

export async function suspendProfileAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await suspendProfile(adminProfilesDeps, admin.id, profileId.parse(formData.get("profileId")));
  revalidatePath("/profiles");
}

export async function unsuspendProfileAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await unsuspendProfile(adminProfilesDeps, admin.id, profileId.parse(formData.get("profileId")));
  revalidatePath("/profiles");
}

export type ActionResult = { ok: true } | { ok: false; error: string };

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
    // Known outcomes (reserved / taken) surface as an error toast, not a crash.
    if (error instanceof ConflictError) {
      return { ok: false, error: `Username not released — ${error.message.toLowerCase()}` };
    }
    throw error;
  }
  revalidatePath("/profiles");
  return { ok: true };
}
