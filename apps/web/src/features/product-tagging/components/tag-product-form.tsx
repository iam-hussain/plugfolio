"use client";

import type { ProductKind } from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
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

const inputClass = "border-border bg-background rounded-md border p-2";

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
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) submit.mutate();
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Product URL
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
          placeholder="https://retailer.com/product — we grab title, image & price"
          className={inputClass}
        />
      </label>

      <fieldset className="flex gap-4 text-sm">
        <legend className="sr-only">Whose product is this?</legend>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name="kind"
            checked={kind === "affiliate"}
            onChange={() => setKind("affiliate")}
          />
          Affiliate product
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" name="kind" checked={kind === "own"} onChange={() => setKind("own")} />
          My own product
        </label>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        {kind === "own" ? "Your store / product link" : "Your affiliate link"}
        <input
          type="url"
          value={affiliateUrl}
          onChange={(event) => setAffiliateUrl(event.target.value)}
          placeholder={
            kind === "own" ? "https://your-store.com/product" : "https://…/your-affiliate-link"
          }
          className={inputClass}
        />
      </label>

      <details className="text-sm">
        <summary className="text-muted-foreground cursor-pointer">+ Add a coupon</summary>
        <div className="flex flex-col gap-3 pt-3">
          <label className="flex flex-col gap-1">
            Code
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              maxLength={40}
              placeholder="MAYA15"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            Valid till (optional)
            <input
              type="date"
              value={offerEnds}
              onChange={(event) => setOfferEnds(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            In-store note (optional)
            <input
              value={inStoreNote}
              onChange={(event) => setInStoreNote(event.target.value)}
              maxLength={200}
              placeholder="Show this code at the counter — Indiranagar store"
              className={inputClass}
            />
            <span className="text-muted-foreground text-xs">
              A coupon needs the link above, an in-store note, or both.
            </span>
          </label>
        </div>
      </details>

      {submit.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={submit.isPending || !canSubmit}>
        {submit.isPending ? "Tagging…" : "Tag product"}
      </Button>
    </form>
  );
}
