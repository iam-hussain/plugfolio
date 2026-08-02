import type { DiscoveryCreator } from "@plugfolio/core";
import { DiscoveryAvatar, DiscoveryCard, discoveryTone } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";

/**
 * A creator on Explore — the same chassis a post and a product get, carrying a
 * person instead of a thing: their latest photo, their name, and what is on the
 * page behind it.
 *
 * `layout="rail"` is the deck on the All tab; scoped to Creators it drops into
 * the shared grid, because a rail says "there is more sideways" and a result
 * set has to say "this is the set".
 */
export function CreatorCard({
  creator,
  index,
  layout,
}: {
  creator: DiscoveryCreator;
  index: number;
  layout: "rail" | "grid";
}) {
  const initial = creator.username.charAt(0).toUpperCase();

  return (
    <DiscoveryCard
      layout={layout}
      tone={discoveryTone(index)}
      avatar={<DiscoveryAvatar initial={initial} src={creator.avatarUrl} />}
      // The byline is the same sentence on all three card kinds: who this is.
      // A creator without a public name leads with the handle instead, and the
      // line above it carries what they do rather than repeating it.
      handle={creator.displayName ?? "Creator"}
      title={
        <Link href={`/${creator.username}`}>{creator.displayName ?? `@${creator.username}`}</Link>
      }
      // A card 190px wide can't carry "18 posts · 42 things" and a verb, and a
      // truncated count is worse than the one that matters: things are what a
      // shopper came for.
      stat={`${creator.productCount} ${creator.productCount === 1 ? "thing" : "things"}`}
      action="Visit →"
      media={
        creator.latestMediaUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image
            src={creator.latestMediaUrl}
            alt=""
            width={480}
            height={600}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          // Nothing posted yet: the mat becomes the card and the initial stands
          // in for a face — better than an empty grey rectangle.
          <span className="text-primary font-display text-display-sm grid size-full place-items-center font-extrabold opacity-40">
            {initial}
          </span>
        )
      }
    />
  );
}
