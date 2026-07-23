"use server";

import { deleteComment } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminContentDeps } from "@/server/container";

export async function deleteCommentAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await deleteComment(
    adminContentDeps,
    admin.id,
    z.string().uuid().parse(formData.get("commentId")),
  );
  revalidatePath("/comments");
}
