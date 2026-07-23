"use server";

import { clearBusinessLogo } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminOversightDeps } from "@/server/container";

export async function clearLogoAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await clearBusinessLogo(
    adminOversightDeps,
    admin.id,
    z.string().uuid().parse(formData.get("businessId")),
  );
  revalidatePath("/businesses");
}
