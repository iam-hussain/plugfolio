"use client";

import type { CategoryView, ShopperProduct } from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { removeProduct, setProductCoupon, updateProduct } from "../api";
import { CategorySelect } from "./category-select";

/** Products tab row (lean journey: "Fix a link, remove one"). */
export type ProductRowProps = {
  product: ShopperProduct;
  categories: readonly CategoryView[];
};

export function ProductRow({ product, categories }: ProductRowProps) {
  const router = useRouter();
  const [affiliateUrl, setAffiliateUrl] = useState(product.affiliateUrl ?? "");
  const [couponCode, setCouponCode] = useState(product.couponCode ?? "");
  const [offerEnds, setOfferEnds] = useState(
    product.offerEndsAt ? product.offerEndsAt.toISOString().slice(0, 10) : "",
  );
  const [inStoreNote, setInStoreNote] = useState(product.inStoreNote ?? "");

  const save = useMutation({
    mutationFn: () => updateProduct(product.id, { affiliateUrl }),
    onSuccess: () => router.refresh(),
  });
  const remove = useMutation({
    mutationFn: () => removeProduct(product.id),
    onSuccess: () => router.refresh(),
  });
  // "Fix a code" (ADR-0011): an empty code clears the whole coupon.
  const saveCoupon = useMutation({
    mutationFn: () =>
      setProductCoupon(product.id, {
        couponCode: couponCode.trim() || null,
        offerEndsAt: couponCode.trim() && offerEnds ? new Date(offerEnds) : null,
        inStoreNote: couponCode.trim() && inStoreNote.trim() ? inStoreNote.trim() : null,
      }),
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate font-medium">
          {product.title}
          {product.kind === "own" ? (
            <span className="text-muted-foreground text-xs font-normal"> · own product</span>
          ) : null}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => remove.mutate()}
          disabled={remove.isPending}
        >
          Remove
        </Button>
      </div>
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (affiliateUrl.trim()) save.mutate();
        }}
      >
        <label className="flex-1">
          <span className="sr-only">Affiliate link for {product.title}</span>
          <input
            type="url"
            value={affiliateUrl}
            onChange={(event) => setAffiliateUrl(event.target.value)}
            className="border-border bg-background w-full rounded-md border p-2 text-sm"
          />
        </label>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={save.isPending || affiliateUrl === (product.affiliateUrl ?? "")}
        >
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </form>
      <details className="text-sm">
        <summary className="text-muted-foreground cursor-pointer text-xs">
          {product.couponCode ? `Coupon: ${product.couponCode}` : "+ Add a coupon"}
        </summary>
        <form
          className="flex flex-col gap-2 pt-2"
          onSubmit={(event) => {
            event.preventDefault();
            saveCoupon.mutate();
          }}
        >
          <div className="flex items-center gap-2">
            <label className="flex-1">
              <span className="sr-only">Coupon code for {product.title}</span>
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                maxLength={40}
                placeholder="Code — empty removes the coupon"
                className="border-border bg-background w-full rounded-md border p-2 text-sm"
              />
            </label>
            <label>
              <span className="sr-only">Offer end date</span>
              <input
                type="date"
                value={offerEnds}
                onChange={(event) => setOfferEnds(event.target.value)}
                className="border-border bg-background rounded-md border p-2 text-sm"
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex-1">
              <span className="sr-only">In-store note</span>
              <input
                value={inStoreNote}
                onChange={(event) => setInStoreNote(event.target.value)}
                maxLength={200}
                placeholder="In-store note (optional)"
                className="border-border bg-background w-full rounded-md border p-2 text-sm"
              />
            </label>
            <Button type="submit" variant="outline" size="sm" disabled={saveCoupon.isPending}>
              {saveCoupon.isPending ? "Saving…" : "Save coupon"}
            </Button>
          </div>
        </form>
      </details>
      <CategorySelect
        target={{ kind: "product", productId: product.id }}
        categories={categories}
        currentCategoryId={product.categoryId}
      />
      {save.isError || remove.isError || saveCoupon.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {(save.error ?? remove.error ?? saveCoupon.error)?.message}
        </p>
      ) : null}
    </div>
  );
}
