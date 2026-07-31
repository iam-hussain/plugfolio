"use server";

import { createAdPlacement, createAdPlacementInput, removeAdPlacement } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adPlacementDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Placing and pulling a sponsored slot (ADR-0020). Operator input is still
 * parsed at the boundary: a bad URL here becomes a slot that sends shoppers
 * nowhere, which is worse than a validation error.
 */
export async function createPlacementAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = createAdPlacementInput.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    imageUrl: formData.get("imageUrl") || null,
    url: formData.get("url"),
    activeUntil: formData.get("activeUntil") || null,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the link and image URL — both must be full https addresses.",
    };
  }
  await createAdPlacement(adPlacementDeps, parsed.data);
  revalidatePath("/sponsored");
  return { ok: true };
}

export async function removePlacementAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  await removeAdPlacement(adPlacementDeps, z.string().min(1).parse(formData.get("id")));
  revalidatePath("/sponsored");
  return { ok: true };
}
