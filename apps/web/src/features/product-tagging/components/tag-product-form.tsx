"use client";

import type { ProductKind } from "@plugfolio/core";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  Label,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { tagProduct } from "../api";

/**
 * The core tool (lean journey + ADR-0011): paste any product URL — Plugfolio
 * grabs the image, title, and price — add the link (affiliate, or your own
 * store), optionally attach a coupon, and it's live on the post. The default
 * path (affiliate, no coupon) must stay exactly as fast as before.
 */
export type TagProductFormProps = {
  profileId: string;
  postId: string;
};

export function TagProductForm({ profileId, postId }: TagProductFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<ProductKind>("affiliate");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [offerEnds, setOfferEnds] = useState("");
  const [inStoreNote, setInStoreNote] = useState("");

  // ADR-0011 channel rule: a link — or a coupon with an in-store note.
  const hasChannel = affiliateUrl.trim()
    ? true
    : Boolean(couponCode.trim() && inStoreNote.trim());
  const canSubmit = Boolean(url.trim()) && hasChannel;

  const submit = useMutation({
    mutationFn: () =>
      tagProduct({
        profileId,
        postId,
        url,
        kind,
        affiliateUrl: affiliateUrl.trim() || undefined,
        couponCode: couponCode.trim() || undefined,
        offerEndsAt: couponCode.trim() && offerEnds ? new Date(offerEnds) : undefined,
        inStoreNote: couponCode.trim() && inStoreNote.trim() ? inStoreNote.trim() : undefined,
      }),
    onSuccess: () => {
      setUrl("");
      setAffiliateUrl("");
      setCouponCode("");
      setOfferEnds("");
      setInStoreNote("");
      router.refresh();
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) submit.mutate();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tag-url">Product URL</Label>
        <Input
          id="tag-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
          placeholder="https://retailer.com/product"
        />
        <p className="text-muted-foreground text-xs">We grab the title, image &amp; price.</p>
      </div>

      {/* Kind toggle (ADR-0011): a two-option segmented control, not a dropdown. */}
      <fieldset>
        <legend className="sr-only">Whose product is this?</legend>
        <div className="border-border grid grid-cols-2 gap-1 rounded-md border p-1" role="presentation">
          {(
            [
              ["affiliate", "Affiliate product"],
              ["own", "My own product"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`flex h-9 cursor-pointer items-center justify-center rounded-sm text-sm font-medium ${
                kind === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <input
                type="radio"
                name="kind"
                className="sr-only"
                checked={kind === value}
                onChange={() => setKind(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tag-affiliate-url">
          {kind === "own" ? "Your store / product link" : "Your affiliate link"}
        </Label>
        <Input
          id="tag-affiliate-url"
          type="url"
          value={affiliateUrl}
          onChange={(event) => setAffiliateUrl(event.target.value)}
          placeholder={
            kind === "own" ? "https://your-store.com/product" : "https://…/your-affiliate-link"
          }
        />
      </div>

      <Collapsible>
        <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
          <ChevronDown className="size-4" />
          Add a coupon
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tag-coupon-code">Code</Label>
                <Input
                  id="tag-coupon-code"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  maxLength={40}
                  placeholder="MAYA15"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tag-coupon-ends">Valid till (optional)</Label>
                <Input
                  id="tag-coupon-ends"
                  type="date"
                  value={offerEnds}
                  onChange={(event) => setOfferEnds(event.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tag-coupon-note">In-store note (optional)</Label>
              <Input
                id="tag-coupon-note"
                value={inStoreNote}
                onChange={(event) => setInStoreNote(event.target.value)}
                maxLength={200}
                placeholder="Show this code at the counter — Indiranagar store"
              />
              <p className="text-muted-foreground text-xs">
                A coupon needs the link above, an in-store note, or both.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {submit.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={submit.isPending || !canSubmit}>
        {submit.isPending ? "Tagging…" : "Tag product"}
      </Button>
    </form>
  );
}
