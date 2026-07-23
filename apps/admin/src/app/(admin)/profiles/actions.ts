"use server";

import { releaseProfileUsername, suspendProfile, unsuspendProfile } from "@plugfolio/core";
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

export async function releaseUsernameAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await releaseProfileUsername(
    adminProfilesDeps,
    admin.id,
    profileId.parse(formData.get("profileId")),
  );
  revalidatePath("/profiles");
}
