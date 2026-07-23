"use server";

import {
  ConflictError,
  releaseProfileUsername,
  releaseUsernameInput,
  suspendProfile,
  unsuspendProfile,
} from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function releaseUsernameAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = releaseUsernameInput.safeParse({
    profileId: formData.get("profileId"),
    username: formData.get("username"),
  });
  if (!parsed.success) {
    redirect(`/profiles?error=${encodeURIComponent("3–30 characters: letters, numbers, dots, dashes")}`);
  }
  try {
    await releaseProfileUsername(adminProfilesDeps, admin.id, parsed.data);
  } catch (error) {
    // Known outcomes (reserved / taken) surface on the page, not a crash.
    if (error instanceof ConflictError) {
      redirect(`/profiles?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
  revalidatePath("/profiles");
}
