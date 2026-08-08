"use client";

import type { ProductKind } from "@plugfolio/core";
import { Pill, PreviewCard, PreviewNoImage } from "@plugfolio/ui";
import Image from "next/image";
import { formatPrice } from "@/lib/format-price";
import { hostname } from "@/lib/retailer-name";

/** The product as the editor knows it. Absent = create, present = edit. */
export type EditableProduct = {
  id: string;
  title: string;
  kind: ProductKind;
  sourceUrl: string | null;
  affiliateUrl: string | null;
  couponCode: string | null;
  offerEndsAt: Date | null;
  inStoreNote: string | null;
  imageUrl: string | null;
  priceCents: number | null;
  currency: string;
  categoryId: string | null;
};

/**
 * The live preview beside the form — the point of the editor's left column.
 *
 * Every field on the right changes one line of it, and a creator editing a
 * coupon should be able to *see* the chip appear rather than imagine it. It's
 * pure: hand it the current form values and it renders, which is also what
 * lets it be a story without a form behind it.
 */
export type ProductEditorPreviewProps = {
  product?: EditableProduct;
  kind: ProductKind;
  affiliateUrl: string;
  couponCode: string;
  /** A just-uploaded image, shown before save overrides the stored one. */
  imageUrl?: string;
};

export function ProductEditorPreview({
  product,
  kind,
  affiliateUrl,
  couponCode,
  imageUrl,
}: ProductEditorPreviewProps) {
  const price = product ? formatPrice(product.priceCents, product.currency) : null;
  const hasLink = affiliateUrl.trim() !== "";
  const hasCode = couponCode.trim() !== "";
  const previewImage = imageUrl?.trim() || product?.imageUrl;

  return (
    <PreviewCard
      image={
        previewImage ? (
          <span className="bg-active rounded-image relative block aspect-square w-full overflow-hidden">
            <Image
              src={previewImage}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 940px) 320px, 100vw"
              className="object-cover"
            />
          </span>
        ) : (
          <PreviewNoImage>The image is fetched from the product URL when you save.</PreviewNoImage>
        )
      }
      title={
        product?.title ?? <span className="text-faint">Title comes from the page you paste</span>
      }
      price={price}
      where={
        <>
          {kind === "own" ? "Their own product" : "Affiliate pick"}
          {hasLink ? ` · opens ${hostname(affiliateUrl) ?? "your link"}` : ""}
        </>
      }
      marks={
        <>
          {kind === "own" ? <Pill tone="own">Their own</Pill> : null}
          {hasCode ? <Pill tone="code">Code {couponCode.trim()}</Pill> : null}
          {product && !price ? <Pill tone="none">No price</Pill> : null}
        </>
      }
    />
  );
}
