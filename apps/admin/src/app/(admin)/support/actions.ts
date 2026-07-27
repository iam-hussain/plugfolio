"use server";

import { NotFoundError, dismissSupportTicket, resolveSupportTicket } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminSupportDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

const ticketId = z.string().uuid();

export async function resolveSupportTicketAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await resolveSupportTicket(adminSupportDeps, admin.id, ticketId.parse(formData.get("ticketId")));
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: error.message };
    throw error;
  }
  revalidatePath("/support");
  return { ok: true };
}

export async function dismissSupportTicketAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await dismissSupportTicket(adminSupportDeps, admin.id, ticketId.parse(formData.get("ticketId")));
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: error.message };
    throw error;
  }
  revalidatePath("/support");
  return { ok: true };
}
