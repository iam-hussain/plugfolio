"use server";

import { suspendMember, unsuspendMember } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminMembersDeps } from "@/server/container";

const userId = z.string().uuid();

export async function suspendMemberAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await suspendMember(adminMembersDeps, admin.id, userId.parse(formData.get("userId")));
  revalidatePath("/members");
}

export async function unsuspendMemberAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await unsuspendMember(adminMembersDeps, admin.id, userId.parse(formData.get("userId")));
  revalidatePath("/members");
}
