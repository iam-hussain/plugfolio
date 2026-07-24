"use server";

import { NotFoundError, deleteComment, deleteCommentsBulk } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminContentDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function deleteCommentAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await deleteComment(
      adminContentDeps,
      admin.id,
      z.string().uuid().parse(formData.get("commentId")),
    );
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: error.message };
    throw error;
  }
  revalidatePath("/comments");
  return { ok: true };
}

export async function bulkDeleteCommentsAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const ids = z
    .array(z.string().uuid())
    .min(1)
    .parse(String(formData.get("ids") ?? "").split(",").filter(Boolean));
  await deleteCommentsBulk(adminContentDeps, admin.id, ids);
  revalidatePath("/comments");
  return { ok: true };
}
