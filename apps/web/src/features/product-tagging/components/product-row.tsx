"use client";

import type { CategoryView, ShopperProduct } from "@plugfolio/core";
import { Badge, Button, Card, CardContent, Input } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { ImageOff, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/format-price";
import { removeProduct, setProductCoupon, updateProduct } from "../api";
import { CategorySelect } from "./category-select";

/**
 * Products-tab card (brief 08: a list you scan, not a CRM): image, name,
 * price, kind tag, coupon summary — fix the link or remove, inline.
 */
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

  const price = formatPrice(product.priceCents, product.currency);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="bg-muted relative block size-14 shrink-0 overflow-hidden rounded-md">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <span className="text-muted-foreground flex size-full items-center justify-center">
                <ImageOff className="size-5" />
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{product.title}</p>
            <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-sm">
              {price ? <span className="tabular-nums">{price}</span> : null}
              {product.kind === "own" ? <Badge variant="outline">Their own product</Badge> : null}
              {product.couponCode ? (
                <span className="bg-accent text-accent-foreground rounded-sm px-1.5 py-0.5 font-mono text-xs font-bold">
                  {product.couponCode}
                </span>
              ) : null}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${product.title}`}
            onClick={() => {
              // Removing affects every post the product is tagged on (brief 08).
              if (window.confirm(`Remove "${product.title}"? It disappears from every post using it.`)) {
                remove.mutate();
              }
            }}
            disabled={remove.isPending}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (affiliateUrl.trim()) save.mutate();
          }}
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Affiliate link for {product.title}</span>
            <Input
              type="url"
              value={affiliateUrl}
              onChange={(event) => setAffiliateUrl(event.target.value)}
              placeholder="https://…/your-affiliate-link"
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
          <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs">
            {product.couponCode ? `Edit coupon (${product.couponCode})` : "+ Add a coupon"}
          </summary>
          <form
            className="flex flex-col gap-2 pt-3"
            onSubmit={(event) => {
              event.preventDefault();
              saveCoupon.mutate();
            }}
          >
            <div className="flex items-center gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Coupon code for {product.title}</span>
                <Input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  maxLength={40}
                  placeholder="Code — empty removes the coupon"
                />
              </label>
              <label>
                <span className="sr-only">Offer end date</span>
                <Input
                  type="date"
                  value={offerEnds}
                  onChange={(event) => setOfferEnds(event.target.value)}
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">In-store note</span>
                <Input
                  value={inStoreNote}
                  onChange={(event) => setInStoreNote(event.target.value)}
                  maxLength={200}
                  placeholder="In-store note (optional)"
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
          <p role="alert" className="text-destructive text-xs">
            {(save.error ?? remove.error ?? saveCoupon.error)?.message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
