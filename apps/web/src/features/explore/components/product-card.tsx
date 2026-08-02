import type { DiscoveryProduct } from "@plugfolio/core";
import { DiscoveryAvatar, DiscoveryCard, discoveryTone } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

/**
 * A thing on Explore — the same chassis as a creator and a post, with the price
 * where every card carries its number and the coupon flagged on the photo.
 *
 * The card opens the PRODUCT page: the outbound tap and its attribution happen
 * one screen later, so discovery never records a buy that didn't start.
 */
export function ProductCard({ product, index }: { product: DiscoveryProduct; index: number }) {
  const couponActive =
    product.couponCode !== null && (!product.offerEndsAt || product.offerEndsAt > new Date());

  return (
    <DiscoveryCard
      tone={discoveryTone(index)}
      avatar={
        <DiscoveryAvatar
          initial={product.username.charAt(0).toUpperCase()}
          src={product.avatarUrl}
        />
      }
      handle={`@${product.username}`}
      title={<Link href={`/${product.username}/product/${product.id}`}>{product.title}</Link>}
      stat={formatPrice(product.priceCents, product.currency) ?? "See price"}
      action={product.kind === "own" ? "Shop →" : "Buy →"}
      flag={
        // Lime means a live offer and prints the code, so a shopper knows what
        // they're getting before the tap. Violet marks the creator's own.
        couponActive
          ? { label: `Code ${product.couponCode}`, tone: "offer" }
          : product.kind === "own"
            ? { label: "Their own", tone: "own" }
            : null
      }
      media={
        product.imageUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image
            src={product.imageUrl}
            alt=""
            width={480}
            height={600}
            unoptimized
            className="size-full object-cover"
          />
        ) : null
      }
    />
  );
}
