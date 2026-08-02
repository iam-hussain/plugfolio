import type { DiscoveryPost } from "@plugfolio/core";
import {
  DiscoveryAvatar,
  DiscoveryCard,
  DiscoveryPinMore,
  discoveryTone,
  ProductTag,
} from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

/**
 * A post on Explore — the same chassis as a creator and a thing, wearing the
 * one detail that makes this product itself: a `ProductTag` pinned on the
 * photograph, price and all.
 *
 * It used to wear three of them, scattered at preset coordinates because tag
 * positions aren't stored — which read as decoration and regularly landed on
 * the subject. One tag, pinned at the foot of the frame where it can never
 * cover what you're looking at, plus a "+N" that opens the post. The tag is a
 * real link to the product; the rest of the card opens the post.
 */
export function PostCard({ post, index }: { post: DiscoveryPost; index: number }) {
  const [lead] = post.tags;
  const more = post.productCount - (lead ? 1 : 0);
  const initial = post.username.charAt(0).toUpperCase();

  return (
    <DiscoveryCard
      tone={discoveryTone(index)}
      avatar={<DiscoveryAvatar initial={initial} src={post.avatarUrl} />}
      handle={`@${post.username}`}
      title={
        <Link href={`/${post.username}/post/${post.id}`}>
          {post.caption ?? "See what's tagged"}
        </Link>
      }
      stat={
        post.productCount > 0
          ? `${post.productCount} ${post.productCount === 1 ? "thing" : "things"}`
          : "Nothing tagged"
      }
      action="Open →"
      media={
        /* ponytail: unoptimized until the social-import pipeline pins image domains */
        <Image
          src={post.mediaUrl}
          alt=""
          width={480}
          height={600}
          unoptimized
          className="size-full object-cover"
        />
      }
      pins={
        lead ? (
          <>
            <ProductTag
              asChild
              tone={lead.tone}
              name={lead.name}
              price={formatPrice(lead.priceCents, lead.currency) ?? ""}
              className="min-w-0 max-w-full"
            >
              <Link
                href={`/${post.username}/product/${lead.productId}`}
                aria-label={`${lead.name} — ${formatPrice(lead.priceCents, lead.currency) ?? "view"}`}
              />
            </ProductTag>
            {more > 0 ? (
              <DiscoveryPinMore asChild>
                <Link
                  href={`/${post.username}/post/${post.id}`}
                  aria-label={`${more} more tagged in this post`}
                >
                  +{more}
                </Link>
              </DiscoveryPinMore>
            ) : null}
          </>
        ) : null
      }
    />
  );
}
