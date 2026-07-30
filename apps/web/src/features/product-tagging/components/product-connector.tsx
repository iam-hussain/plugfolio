"use client";

import type { CreatorProductRow } from "@plugfolio/core";
import { Button, Fold, IconAction, Input, PickList, PickRow } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { formatPrice } from "@/lib/format-price";
import { connectProduct, disconnectProduct } from "../api";

/**
 * "Connect a product" (DESIGN post-edit.html §.fold + §.picks).
 *
 * Folded, because most visits to a post are to check what's on it rather than
 * to add to it — an always-open block makes the common case look unfinished.
 *
 * Connecting is a pick, not a form. Everything shown is a fact about the
 * product itself — price, kind, how many posts already carry it — so a creator
 * can tell two similar products apart before connecting one. The channel rule
 * lives on the product page, because that's where a product is *made*; asking
 * it here would mean two screens could disagree about the same object.
 */
export type ProductConnectorProps = {
  postId: string;
  /** The whole library. Already-connected ones are filtered out by the caller. */
  products: readonly CreatorProductRow[];
  /** Where "New" goes — the product page in create mode. */
  newProductHref: Route;
};

export function ProductConnector({ postId, products, newProductHref }: ProductConnectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const connect = useMutation({
    mutationFn: (productId: string) => connectProduct(postId, productId),
    onSuccess: () => router.refresh(),
  });

  const term = query.trim().toLowerCase();
  const shown = term
    ? products.filter((product) => product.title.toLowerCase().includes(term))
    : products;

  return (
    <Fold
      className="mt-3.5"
      open={open}
      onToggle={() => setOpen((was) => !was)}
      title="Connect a product"
    >
      <div className="mb-2.5 flex flex-wrap gap-2">
        <label className="min-w-0 flex-[1_1_200px]">
          <span className="sr-only">Search your products</span>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your products…"
            autoComplete="off"
          />
        </label>
        <Button variant="outline" asChild>
          <Link href={newProductHref}>New</Link>
        </Button>
      </div>

      {shown.length === 0 ? (
        <p className="text-muted-foreground text-copy">
          {products.length === 0
            ? "Every product you have is already on this post."
            : `Nothing matches “${query}”.`}
        </p>
      ) : (
        <PickList>
          {shown.map((product) => {
            const price = formatPrice(product.priceCents, product.currency);
            const channel = product.affiliateUrl
              ? product.kind === "own"
                ? "their own"
                : "affiliate"
              : "in-store code";
            const used =
              product.postCount === 0
                ? "not on any post"
                : `on ${product.postCount} ${product.postCount === 1 ? "post" : "posts"}`;
            return (
              <PickRow
                key={product.id}
                disabled={connect.isPending}
                onClick={() => connect.mutate(product.id)}
                image={
                  <span className="bg-active rounded-image relative size-11 flex-none overflow-hidden">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt=""
                        fill
                        unoptimized
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                }
                title={product.title}
                meta={`${price ?? "No price"} · ${channel} · ${used}`}
                action={connect.isPending ? "Connecting…" : "Connect"}
              />
            );
          })}
        </PickList>
      )}

      {connect.isError ? (
        <p role="alert" className="text-destructive text-micro mt-2.5">
          {connect.error.message}
        </p>
      ) : null}

      <p className="text-faint text-micro mt-2.5">
        Connecting copies nothing — change a price once and every post carrying it changes with it.
      </p>
    </Fold>
  );
}

/** Take a product off this post. Not a delete: it's still yours, still listed. */
export function DisconnectProductButton({
  postId,
  productId,
  title,
  children,
}: {
  postId: string;
  productId: string;
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const disconnect = useMutation({
    mutationFn: () => disconnectProduct(postId, productId),
    onSuccess: () => router.refresh(),
  });

  return (
    <IconAction
      tone="danger"
      label={`Disconnect ${title} from this post`}
      disabled={disconnect.isPending}
      onClick={() => disconnect.mutate()}
    >
      {children}
    </IconAction>
  );
}
