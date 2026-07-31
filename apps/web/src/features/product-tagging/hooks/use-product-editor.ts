"use client";

import type { ProductKind } from "@plugfolio/core";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createProduct,
  removeProduct,
  setProductCategory,
  setProductCoupon,
  updateProduct,
} from "../api";
import type { EditableProduct } from "../components/product-editor-preview";

/**
 * Everything the product editor *does*, with none of what it looks like.
 *
 * The editor is one screen with three jobs — hold a form's worth of state,
 * enforce the channel rule, and write through two services in a specific
 * order — and they were interleaved with 200 lines of JSX in one component.
 * Pulled apart, the rule below is readable on its own and testable without
 * rendering anything.
 */
const dateValue = (date: Date | null) => (date ? date.toISOString().slice(0, 10) : "");

export type UseProductEditorArgs = {
  profileId: string;
  product?: EditableProduct;
  /** Where the library lives — the landing spot after a create or a delete. */
  libraryHref: Route;
};

export function useProductEditor({ profileId, product, libraryHref }: UseProductEditorArgs) {
  const router = useRouter();
  const [sourceUrl, setSourceUrl] = useState(product?.sourceUrl ?? "");
  const [kind, setKind] = useState<ProductKind>(product?.kind ?? "affiliate");
  const [affiliateUrl, setAffiliateUrl] = useState(product?.affiliateUrl ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [couponOpen, setCouponOpen] = useState(Boolean(product?.couponCode));
  const [couponCode, setCouponCode] = useState(product?.couponCode ?? "");
  const [offerEnds, setOfferEnds] = useState(dateValue(product?.offerEndsAt ?? null));
  const [inStoreNote, setInStoreNote] = useState(product?.inStoreNote ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");

  // The same channel rule the tagging editor enforces, because it is the same
  // object: a product needs a link, or a code with an in-store note, or both.
  // Without one it could take no taps and no copies.
  const hasSource = sourceUrl.trim() !== "";
  const hasLink = affiliateUrl.trim() !== "";
  const hasCode = couponCode.trim() !== "";
  const hasInStore = hasCode && inStoreNote.trim() !== "";
  // The source URL is how a NEW product gets its title, image and price, so
  // creating without one has nothing to make. An existing product already has
  // them — a row from before the field existed must still be editable, or a
  // creator can't fix its coupon.
  const needsSource = !product && !hasSource;
  const ready = !needsSource && (hasLink || hasInStore);

  const rule = needsSource
    ? "Paste the product URL to start."
    : hasLink && hasInStore
      ? "Ready — it opens the retailer and the code works in a shop."
      : hasLink
        ? "Ready — tapping Buy will open your link."
        : hasInStore
          ? "Ready — the code is the action; there is no Buy button on this one."
          : "A product needs somewhere to go: a link, or a code with an in-store note, or both.";

  const save = useMutation({
    mutationFn: async () => {
      const coupon = {
        couponCode: couponCode.trim() || null,
        offerEndsAt: hasCode && offerEnds ? new Date(offerEnds) : null,
        inStoreNote: hasCode && inStoreNote.trim() ? inStoreNote.trim() : null,
      };

      if (!product) {
        const created = await createProduct({
          profileId,
          url: sourceUrl.trim(),
          kind,
          categoryId: categoryId || null,
          ...(hasLink ? { affiliateUrl: affiliateUrl.trim() } : {}),
          ...(coupon.couponCode ? { couponCode: coupon.couponCode } : {}),
          ...(coupon.offerEndsAt ? { offerEndsAt: coupon.offerEndsAt } : {}),
          ...(coupon.inStoreNote ? { inStoreNote: coupon.inStoreNote } : {}),
        });
        return created.product.id;
      }

      // The link write has to land before the coupon one: the service checks
      // the channel rule against what's stored, and an in-store-only coupon is
      // only legal once the link is actually gone.
      await updateProduct(product.id, {
        ...(hasSource ? { sourceUrl: sourceUrl.trim() } : {}),
        kind,
        affiliateUrl: hasLink ? affiliateUrl.trim() : null,
        // An uploaded image overrides the scrape; only sent when it changed.
        ...(imageUrl.trim() && imageUrl.trim() !== (product.imageUrl ?? "")
          ? { imageUrl: imageUrl.trim() }
          : {}),
        // Re-read the page only when the source actually changed. A silent
        // refetch would let a retailer's A/B test rename someone's product.
        refreshMetadata: sourceUrl.trim() !== (product.sourceUrl ?? ""),
      });
      await setProductCoupon(product.id, coupon);
      if ((categoryId || null) !== product.categoryId) {
        await setProductCategory(product.id, { categoryId: categoryId || null });
      }
      return null;
    },
    onSuccess: (created) => {
      // Back where the creator came from — the library, or the post whose
      // connector sent them here.
      if (created) router.push(libraryHref);
      else router.refresh();
    },
  });

  const remove = useMutation({
    mutationFn: () => removeProduct(product!.id),
    onSuccess: () => router.push(libraryHref),
  });

  return {
    fields: {
      sourceUrl,
      setSourceUrl,
      kind,
      setKind,
      affiliateUrl,
      setAffiliateUrl,
      categoryId,
      setCategoryId,
      couponOpen,
      setCouponOpen,
      couponCode,
      setCouponCode,
      offerEnds,
      setOfferEnds,
      inStoreNote,
      setInStoreNote,
      imageUrl,
      setImageUrl,
    },
    state: { hasSource, hasLink, hasCode, ready, rule },
    save,
    remove,
  };
}

export type ProductEditorFields = ReturnType<typeof useProductEditor>["fields"];
