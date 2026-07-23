"use server";

import { deletePost } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminContentDeps } from "@/server/container";

export async function deletePostAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await deletePost(adminContentDeps, admin.id, z.string().uuid().parse(formData.get("postId")));
  revalidatePath("/posts");
}
