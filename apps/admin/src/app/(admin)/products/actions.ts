"use server";

import {
  NotFoundError,
  clearProductCoupon,
  deleteProduct,
  deleteProductsBulk,
} from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminContentDeps } from "@/server/container";

export type ActionResult = { ok: true } | { ok: false; error: string };

const productId = z.string().uuid();

function fail(error: unknown): ActionResult {
  if (error instanceof NotFoundError) return { ok: false, error: error.message };
  throw error;
}

export async function deleteProductAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await deleteProduct(adminContentDeps, admin.id, productId.parse(formData.get("productId")));
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/products");
  return { ok: true };
}

export async function clearCouponAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await clearProductCoupon(adminContentDeps, admin.id, productId.parse(formData.get("productId")));
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/products");
  return { ok: true };
}

export async function bulkDeleteProductsAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const ids = z
    .array(productId)
    .min(1)
    .parse(String(formData.get("ids") ?? "").split(",").filter(Boolean));
  await deleteProductsBulk(adminContentDeps, admin.id, ids);
  revalidatePath("/products");
  return { ok: true };
}
