"use server";

import { removeRequirement } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminOversightDeps } from "@/server/container";

export async function removeRequirementAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await removeRequirement(
    adminOversightDeps,
    admin.id,
    z.string().uuid().parse(formData.get("requirementId")),
  );
  revalidatePath("/requirements");
}
