"use server";

import { NotFoundError, deletePost, deletePostsBulk } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminContentDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function deletePostAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await deletePost(adminContentDeps, admin.id, z.string().uuid().parse(formData.get("postId")));
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: error.message };
    throw error;
  }
  revalidatePath("/posts");
  return { ok: true };
}

export async function bulkDeletePostsAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const ids = z
    .array(z.string().uuid())
    .min(1)
    .parse(String(formData.get("ids") ?? "").split(",").filter(Boolean));
  await deletePostsBulk(adminContentDeps, admin.id, ids);
  revalidatePath("/posts");
  return { ok: true };
}
