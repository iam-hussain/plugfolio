"use server";

import { NotFoundError, removeRequirement } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminOversightDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function removeRequirementAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await removeRequirement(
      adminOversightDeps,
      admin.id,
      z.string().uuid().parse(formData.get("requirementId")),
    );
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: error.message };
    throw error;
  }
  revalidatePath("/requirements");
  return { ok: true };
}
