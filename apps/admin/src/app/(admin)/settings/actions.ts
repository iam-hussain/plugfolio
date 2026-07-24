"use server";

import { removeFeatureFlag, setFeatureFlag, setReservedUsernames } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { appSettingsDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveReservedUsernamesAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const lines = z.string().parse(formData.get("usernames") ?? "").split("\n");
  await setReservedUsernames(appSettingsDeps, admin.id, lines);
  revalidatePath("/settings");
  return { ok: true };
}

export async function setFeatureFlagAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const name = z.string().min(1).parse(formData.get("name"));
  const enabled = formData.get("enabled") === "true";
  try {
    await setFeatureFlag(appSettingsDeps, admin.id, name, enabled);
  } catch {
    return { ok: false, error: "Flag names are kebab-case: letters, digits, dashes" };
  }
  revalidatePath("/settings");
  return { ok: true };
}

export async function removeFeatureFlagAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const name = z.string().min(1).parse(formData.get("name"));
  await removeFeatureFlag(appSettingsDeps, admin.id, name);
  revalidatePath("/settings");
  return { ok: true };
}
