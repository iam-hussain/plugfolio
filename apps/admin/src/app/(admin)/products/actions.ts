"use server";

import { clearProductCoupon, deleteProduct } from "@plugfolio/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { adminContentDeps } from "@/server/container";

const productId = z.string().uuid();

export async function deleteProductAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await deleteProduct(adminContentDeps, admin.id, productId.parse(formData.get("productId")));
  revalidatePath("/products");
}

export async function clearCouponAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await clearProductCoupon(adminContentDeps, admin.id, productId.parse(formData.get("productId")));
  revalidatePath("/products");
}
