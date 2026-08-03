"use client";

import type { CategoryView } from "@plugfolio/core";
import {
  Button,
  CardFoot,
  DashCard,
  DashCardHead,
  DashCardTitle,
  DashField,
  Input,
  MiniButton,
  NativeSelect,
  RuleLine,
  Segmented,
  SegmentedOption,
} from "@plugfolio/ui";
import type { Route } from "next";
import { Trash2 } from "lucide-react";
import { useProductEditor } from "../hooks/use-product-editor";
import { CouponFields } from "./coupon-fields";
import { ImageUploadButton } from "./image-upload-button";
import { ProductEditorPreview, type EditableProduct } from "./product-editor-preview";
import { ShelfOptions } from "./shelf-options";

/**
 * The product editor (DESIGN product-edit.html) — the same screen for create
 * and edit.
 *
 * Its own page, because a product is not owned by the post it was tagged on.
 * It can sit on several posts, or on none once its post is deleted, and every
 * one of them shows the same title, price, link and coupon. Editing it from
 * inside one post's editor made a shared object look like that post's property.
 *
 * This file is now the *composition* only: the preview column, the fields, and
 * the coupon fold are their own components, and the state, the channel rule and
 * the two-step write live in `useProductEditor`.
 */
export type ProductEditorProps = {
  profileId: string;
  categories: readonly CategoryView[];
  /** Absent = create. Present = edit. */
  product?: EditableProduct;
  /** Where the library lives — the landing spot after a create or a delete. */
  libraryHref: Route;
};

export function ProductEditor({ profileId, categories, product, libraryHref }: ProductEditorProps) {
  const { fields, state, save, remove } = useProductEditor({ profileId, product, libraryHref });

  return (
    // v2: the form leads; the shopper preview rides sticky on the right.
    <div className="grid items-start gap-[18px] min-[940px]:grid-cols-[minmax(0,1fr)_minmax(0,38%)] min-[940px]:gap-[26px]">
      <div className="min-w-0 min-[940px]:order-last">
        <ProductEditorPreview
          product={product}
          kind={fields.kind}
          affiliateUrl={fields.affiliateUrl}
          couponCode={fields.couponCode}
          imageUrl={fields.imageUrl}
        />
      </div>

      <div>
        <DashCard>
          <DashCardHead>
            <DashCardTitle>The product</DashCardTitle>
          </DashCardHead>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (state.ready) save.mutate();
            }}
          >
            <DashField
              label="Product URL"
              htmlFor="product-url"
              note="We grab the title, image and price from it. If a page won’t read, the product is titled by its site — never an error, and you can still tag it."
            >
              <Input
                id="product-url"
                type="url"
                value={fields.sourceUrl}
                onChange={(event) => fields.setSourceUrl(event.target.value)}
                placeholder="https://retailer.com/product"
                // Only on create: native validation silently refuses to submit
                // the form, so requiring it on a legacy row with no source URL
                // would make Save do nothing at all, with no message.
                required={!product}
              />
            </DashField>

            {/* Relabels the link field rather than adding a second one — a
                creator has exactly one URL in their clipboard. */}
            <DashField
              label="Kind"
              note="Own products carry a quiet trust marker and their button reads “Shop their store”. Nothing else differs."
            >
              <Segmented label="Product kind">
                {(["affiliate", "own"] as const).map((option) => (
                  <SegmentedOption
                    key={option}
                    selected={fields.kind === option}
                    onClick={() => fields.setKind(option)}
                  >
                    {option === "own" ? "My own product" : "Affiliate product"}
                  </SegmentedOption>
                ))}
              </Segmented>
            </DashField>

            <DashField
              label={fields.kind === "own" ? "Your store / product link" : "Your affiliate link"}
              htmlFor="product-link"
            >
              <Input
                id="product-link"
                type="url"
                value={fields.affiliateUrl}
                onChange={(event) => fields.setAffiliateUrl(event.target.value)}
                placeholder="https://…/your-link"
              />
            </DashField>

            {/* Upload only when editing: a new product's image is scraped from
                the URL on first save; a replacement can be uploaded after. */}
            {product ? (
              <DashField
                label="Photo"
                note="Replace the scraped image with your own — cropped, watermarked and stored."
              >
                <ImageUploadButton
                  kind="product"
                  onUploaded={fields.setImageUrl}
                  label="Upload photo"
                />
              </DashField>
            ) : null}

            {categories.length > 0 ? (
              <DashField label="Shelf" htmlFor="product-shelf">
                <NativeSelect
                  id="product-shelf"
                  className="w-full"
                  value={fields.categoryId}
                  onChange={(event) => fields.setCategoryId(event.target.value)}
                >
                  <ShelfOptions categories={categories} />
                </NativeSelect>
              </DashField>
            ) : null}

            <CouponFields fields={fields} />

            <RuleLine ok={state.ready}>{state.rule}</RuleLine>

            {save.isError || remove.isError ? (
              <p role="alert" className="text-destructive text-copy mt-3.5">
                {(save.error ?? remove.error)?.message}
              </p>
            ) : null}

            <CardFoot>
              <Button type="submit" disabled={!state.ready || save.isPending}>
                {save.isPending ? "Saving…" : product ? "Save product" : "Add product"}
              </Button>
              {product ? (
                <MiniButton
                  danger
                  data-slot="card-foot-danger"
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
                  <Trash2 aria-hidden />
                  {remove.isPending ? "Removing…" : "Remove"}
                </MiniButton>
              ) : null}
            </CardFoot>
          </form>
        </DashCard>
      </div>
    </div>
  );
}
