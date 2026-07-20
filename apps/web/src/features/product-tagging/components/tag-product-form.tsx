"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { tagProduct } from "../api";

/**
 * The core tool (lean journey): paste any product URL — Plugfolio grabs the
 * image, title, and price — add the affiliate link, and it's live on the post.
 */
export type TagProductFormProps = {
  profileId: string;
  postId: string;
};

export function TagProductForm({ profileId, postId }: TagProductFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");

  const submit = useMutation({
    mutationFn: () => tagProduct({ profileId, postId, url, affiliateUrl }),
    onSuccess: () => {
      setUrl("");
      setAffiliateUrl("");
      router.refresh();
    },
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (url.trim() && affiliateUrl.trim()) submit.mutate();
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
          className="border-border bg-background rounded-md border p-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Your affiliate link
        <input
          type="url"
          value={affiliateUrl}
          onChange={(event) => setAffiliateUrl(event.target.value)}
          required
          placeholder="https://…/your-affiliate-link"
          className="border-border bg-background rounded-md border p-2"
        />
      </label>
      {submit.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={submit.isPending}>
        {submit.isPending ? "Tagging…" : "Tag product"}
      </Button>
    </form>
  );
}
