"use client";

import type { CategoryView, ShopperProduct } from "@plugfolio/core";
import {
  Button,
  DashCard,
  DashCardHead,
  DashCardTitle,
  DashField,
  DashFieldPair,
  DangerZone,
  Hint,
  Input,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { removeProduct, setProductCoupon, updateProduct } from "../api";
import { CategorySelect } from "./category-select";

/**
 * The product editor (DESIGN product-edit.html; dashboard.html §5.21 sends
 * every row here).
 *
 * Editing lives on one screen, not two. Inline link, coupon and shelf editors
 * used to sit in the library row, which meant two surfaces could each claim to
 * be where a product is changed — and the library is meant to be a list you
 * scan, not a CRM.
 */
export type ProductEditorProps = {
  product: ShopperProduct;
  categories: readonly CategoryView[];
  /** Where to land after the product is deleted. */
  onRemovedHref: string;
};

export function ProductEditor({ product, categories, onRemovedHref }: ProductEditorProps) {
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
    onSuccess: () => router.push(onRemovedHref),
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
    <>
      <DashCard>
        <DashCardHead>
          <DashCardTitle>Where it goes</DashCardTitle>
        </DashCardHead>
        <Hint>
          Your own affiliate link. Plugfolio never rewrites it and never takes a cut — whatever the
          retailer pays you is between the two of you.
        </Hint>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (affiliateUrl.trim()) save.mutate();
          }}
        >
          <DashField label="Affiliate link" htmlFor="affiliate-url">
            <Input
              id="affiliate-url"
              type="url"
              value={affiliateUrl}
              onChange={(event) => setAffiliateUrl(event.target.value)}
              placeholder="https://…/your-affiliate-link"
            />
          </DashField>
          <Button
            type="submit"
            disabled={save.isPending || affiliateUrl === (product.affiliateUrl ?? "")}
          >
            {save.isPending ? "Saving…" : "Save link"}
          </Button>
        </form>
      </DashCard>

      <DashCard>
        <DashCardHead>
          <DashCardTitle>Coupon</DashCardTitle>
        </DashCardHead>
        <Hint>
          A code shoppers can copy. Plugfolio counts the copies and nothing more — redemption
          happens at the retailer, where we cannot see it. Clearing the code removes the whole
          coupon.
        </Hint>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveCoupon.mutate();
          }}
        >
          <DashFieldPair>
            <DashField label="Code" htmlFor="coupon-code" note="Empty removes the coupon.">
              <Input
                id="coupon-code"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                maxLength={40}
                placeholder="SAVE30"
              />
            </DashField>
            <DashField label="Offer ends" htmlFor="offer-ends">
              <Input
                id="offer-ends"
                type="date"
                value={offerEnds}
                onChange={(event) => setOfferEnds(event.target.value)}
              />
            </DashField>
          </DashFieldPair>
          <DashField
            label="In-store note"
            htmlFor="in-store-note"
            note="For a code with no link — “show at the counter”."
          >
            <Input
              id="in-store-note"
              value={inStoreNote}
              onChange={(event) => setInStoreNote(event.target.value)}
              maxLength={200}
              placeholder="Show this at the till"
            />
          </DashField>
          <Button type="submit" disabled={saveCoupon.isPending}>
            {saveCoupon.isPending ? "Saving…" : "Save coupon"}
          </Button>
        </form>
      </DashCard>

      <DashCard>
        <DashCardHead>
          <DashCardTitle>Shelf</DashCardTitle>
        </DashCardHead>
        <Hint>
          Shelves are yours alone — there is no shared list of categories across Plugfolio. A
          product sits on one shelf, or none.
        </Hint>
        <CategorySelect
          target={{ kind: "product", productId: product.id }}
          categories={categories}
          currentCategoryId={product.categoryId}
        />
      </DashCard>

      <DashCard>
        <DangerZone
          title="Remove this product"
          action={
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                // Removing affects every post the product is tagged on.
                if (
                  window.confirm(
                    `Remove "${product.title}"? It disappears from every post using it.`,
                  )
                ) {
                  remove.mutate();
                }
              }}
            >
              {remove.isPending ? "Removing…" : `Remove ${product.title}`}
            </Button>
          }
        >
          It disappears from every post it is tagged on. Taps already recorded stay in your traffic
          totals — they happened.
        </DangerZone>
      </DashCard>

      {save.isError || remove.isError || saveCoupon.isError ? (
        <p role="alert" className="text-destructive mt-3.5 text-copy">
          {(save.error ?? remove.error ?? saveCoupon.error)?.message}
        </p>
      ) : null}
    </>
  );
}
