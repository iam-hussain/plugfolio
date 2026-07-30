import type { DiscoveryProduct } from "@plugfolio/core";
import { ThingCard } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

/**
 * A product in the explore things grid (DESIGN explore.html §.thing-c). The
 * card is the design system's; this decides what it says.
 *
 * The card opens the PRODUCT page — the outbound tap and its attribution
 * happen one screen later, so discovery never records a buy that didn't start.
 */
export function ProductCard({ product }: { product: DiscoveryProduct }) {
  const couponActive =
    product.couponCode !== null && (!product.offerEndsAt || product.offerEndsAt > new Date());

  return (
    <ThingCard
      asChild
      title={product.title}
      by={`by @${product.username}`}
      price={formatPrice(product.priceCents, product.currency)}
      go={product.kind === "own" ? "Shop →" : "Buy →"}
      flag={
        // Lime means a live offer and prints the code, so a shopper knows what
        // they're getting before the tap. Violet marks the creator's own.
        couponActive
          ? { label: `Code ${product.couponCode}`, tone: "offer" }
          : product.kind === "own"
            ? { label: "Their own", tone: "own" }
            : null
      }
      image={
        product.imageUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image
            src={product.imageUrl}
            alt=""
            width={480}
            height={480}
            unoptimized
            className="size-full object-cover"
          />
        ) : null
      }
    >
      <Link href={`/${product.username}/product/${product.id}`} />
    </ThingCard>
  );
}
