"use client";

import type { CategoryView, ProductKind } from "@plugfolio/core";
import {
  Button,
  CardFoot,
  DashCard,
  DashCardHead,
  DashCardTitle,
  DashField,
  DashFieldPair,
  Fold,
  Input,
  MiniButton,
  NativeSelect,
  NativeSelectOption,
  Pill,
  PreviewCard,
  PreviewNoImage,
  RuleLine,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/format-price";
import {
  createProduct,
  removeProduct,
  setProductCategory,
  setProductCoupon,
  updateProduct,
} from "../api";

/**
 * The product editor (DESIGN product-edit.html) — the same screen for create
 * and edit.
 *
 * Its own page, because a product is not owned by the post it was tagged on.
 * It can sit on several posts, or on none once its post is deleted, and every
 * one of them shows the same title, price, link and coupon. Editing it from
 * inside one post's editor made a shared object look like that post's
 * property.
 *
 * The preview is the point of the left column: every field here changes one
 * line of it, and a creator editing a coupon should be able to *see* the chip
 * appear rather than imagine it.
 */
export type ProductEditorProps = {
  profileId: string;
  categories: readonly CategoryView[];
  /** Absent = create. Present = edit. */
  product?: {
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
  /** Where the library lives — the landing spot after a create or a delete. */
  libraryHref: Route;
};

const dateValue = (date: Date | null) => (date ? date.toISOString().slice(0, 10) : "");

export function ProductEditor({
  profileId,
  categories,
  product,
  libraryHref,
}: ProductEditorProps) {
  const router = useRouter();
  const [sourceUrl, setSourceUrl] = useState(product?.sourceUrl ?? "");
  const [kind, setKind] = useState<ProductKind>(product?.kind ?? "affiliate");
  const [affiliateUrl, setAffiliateUrl] = useState(product?.affiliateUrl ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [couponOpen, setCouponOpen] = useState(Boolean(product?.couponCode));
  const [couponCode, setCouponCode] = useState(product?.couponCode ?? "");
  const [offerEnds, setOfferEnds] = useState(dateValue(product?.offerEndsAt ?? null));
  const [inStoreNote, setInStoreNote] = useState(product?.inStoreNote ?? "");

  // The same channel rule the tagging editor enforces, because it is the same
  // object: a product needs a link, or a code with an in-store note, or both.
  // Without one it could take no taps and no copies.
  const hasSource = sourceUrl.trim() !== "";
  const hasLink = affiliateUrl.trim() !== "";
  const hasCode = couponCode.trim() !== "";
  const hasInStore = hasCode && inStoreNote.trim() !== "";
  const ready = hasSource && (hasLink || hasInStore);

  const rule = !hasSource
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
        sourceUrl: sourceUrl.trim(),
        kind,
        affiliateUrl: hasLink ? affiliateUrl.trim() : null,
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

  const price = product ? formatPrice(product.priceCents, product.currency) : null;

  return (
    <div className="grid items-start gap-[18px] min-[940px]:grid-cols-[minmax(0,38%)_minmax(0,1fr)] min-[940px]:gap-[26px]">
      <PreviewCard
        image={
          product?.imageUrl ? (
            <span className="bg-active rounded-image relative block aspect-square w-full overflow-hidden">
              <Image
                src={product.imageUrl}
                alt=""
                fill
                unoptimized
                sizes="(min-width: 940px) 320px, 100vw"
                className="object-cover"
              />
            </span>
          ) : (
            <PreviewNoImage>
              The image is fetched from the product URL when you save.
            </PreviewNoImage>
          )
        }
        title={
          product?.title ?? (
            <span className="text-faint">Title comes from the page you paste</span>
          )
        }
        price={price}
        where={
          <>
            {kind === "own" ? "Their own product" : "Affiliate pick"}
            {hasLink ? ` · opens ${hostOf(affiliateUrl) ?? "your link"}` : ""}
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

      <div>
        <DashCard>
          <DashCardHead>
            <DashCardTitle>The product</DashCardTitle>
          </DashCardHead>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (ready) save.mutate();
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
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="https://retailer.com/product"
                required
              />
            </DashField>

            {/* Relabels the link field rather than adding a second one — a
                creator has exactly one URL in their clipboard. */}
            <DashField
              label="Kind"
              note="Own products carry a quiet trust marker and their button reads “Shop their store”. Nothing else differs."
            >
              <div className="border-border bg-background rounded-image flex gap-[3px] border p-[3px]">
                {(["affiliate", "own"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={kind === option}
                    onClick={() => setKind(option)}
                    className={
                      kind === option
                        ? "rounded-nest text-micro bg-foreground text-background min-h-10 flex-1 border-0 font-bold"
                        : "rounded-nest text-micro text-muted-foreground min-h-10 flex-1 border-0 bg-transparent font-bold"
                    }
                  >
                    {option === "own" ? "My own product" : "Affiliate product"}
                  </button>
                ))}
              </div>
            </DashField>

            <DashField
              label={kind === "own" ? "Your store / product link" : "Your affiliate link"}
              htmlFor="product-link"
            >
              <Input
                id="product-link"
                type="url"
                value={affiliateUrl}
                onChange={(event) => setAffiliateUrl(event.target.value)}
                placeholder="https://…/your-link"
              />
            </DashField>

            {categories.length > 0 ? (
              <DashField label="Shelf" htmlFor="product-shelf">
                <NativeSelect
                  id="product-shelf"
                  className="w-full"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <NativeSelectOption value="">None</NativeSelectOption>
                  {categories.map((category) => (
                    <NativeSelectOption key={category.id} value={category.id}>
                      {category.title}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </DashField>
            ) : null}

            {/* The offer is part of the product, not a second subject — it had
                its own card once, which made one optional field look like a
                separate thing to manage. */}
            <Fold
              className="mt-1"
              open={couponOpen}
              onToggle={() => setCouponOpen((was) => !was)}
              title="Coupon"
            >
              <DashField
                label="Code"
                htmlFor="coupon-code"
                note="Clearing the code removes the whole offer."
              >
                <Input
                  id="coupon-code"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  maxLength={40}
                  placeholder="SAVE30"
                />
              </DashField>
              <DashFieldPair>
                <DashField label="Valid till" hint="· optional" htmlFor="offer-ends">
                  <Input
                    id="offer-ends"
                    type="date"
                    value={offerEnds}
                    onChange={(event) => setOfferEnds(event.target.value)}
                  />
                </DashField>
                <DashField label="In-store note" hint="· optional" htmlFor="in-store-note">
                  <Input
                    id="in-store-note"
                    value={inStoreNote}
                    onChange={(event) => setInStoreNote(event.target.value)}
                    maxLength={200}
                    placeholder="Show at the counter"
                  />
                </DashField>
              </DashFieldPair>
              <p className="text-faint text-micro">
                An in-store note makes this an in-store offer: copies are counted, redemption is
                not. A product with a note and no link has no Buy button at all — the code is the
                whole action.
              </p>
            </Fold>

            <RuleLine ok={ready}>{rule}</RuleLine>

            {save.isError || remove.isError ? (
              <p role="alert" className="text-destructive text-copy mt-3.5">
                {(save.error ?? remove.error)?.message}
              </p>
            ) : null}

            <CardFoot>
              <Button type="submit" disabled={!ready || save.isPending}>
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

/** "opens Nykaa" — the retailer, not the URL. */
function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
