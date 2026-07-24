"use server";

import { NotFoundError, deleteCollabMessage } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminCollabsDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function deleteCollabMessageAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await deleteCollabMessage(
      adminCollabsDeps,
      admin.id,
      z.string().uuid().parse(formData.get("messageId")),
    );
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: error.message };
    throw error;
  }
  revalidatePath("/collabs");
  return { ok: true };
}
