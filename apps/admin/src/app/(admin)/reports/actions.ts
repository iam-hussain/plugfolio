"use server";

import { NotFoundError, dismissReport, resolveReport } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminReportsDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

const reportId = z.string().uuid();

export async function resolveReportAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await resolveReport(adminReportsDeps, admin.id, reportId.parse(formData.get("reportId")));
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: error.message };
    throw error;
  }
  revalidatePath("/reports");
  return { ok: true };
}

export async function dismissReportAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await dismissReport(adminReportsDeps, admin.id, reportId.parse(formData.get("reportId")));
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: error.message };
    throw error;
  }
  revalidatePath("/reports");
  return { ok: true };
}
