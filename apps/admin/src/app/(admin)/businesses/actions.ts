"use server";

import { NotFoundError, clearBusinessLogo } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminOversightDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function clearLogoAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await clearBusinessLogo(
      adminOversightDeps,
      admin.id,
      z.string().uuid().parse(formData.get("businessId")),
    );
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: error.message };
    throw error;
  }
  revalidatePath("/businesses");
  return { ok: true };
}
