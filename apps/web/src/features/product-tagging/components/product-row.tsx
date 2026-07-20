"use client";

import type { ShopperProduct } from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { removeProduct, updateProduct } from "../api";

/** Products tab row (lean journey: "Fix a link, remove one"). */
export type ProductRowProps = {
  product: ShopperProduct;
};

export function ProductRow({ product }: ProductRowProps) {
  const router = useRouter();
  const [affiliateUrl, setAffiliateUrl] = useState(product.affiliateUrl);

  const save = useMutation({
    mutationFn: () => updateProduct(product.id, { affiliateUrl }),
    onSuccess: () => router.refresh(),
  });
  const remove = useMutation({
    mutationFn: () => removeProduct(product.id),
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-medium">{product.title}</span>
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
          disabled={save.isPending || affiliateUrl === product.affiliateUrl}
        >
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </form>
      {save.isError || remove.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {(save.error ?? remove.error)?.message}
        </p>
      ) : null}
    </div>
  );
}
