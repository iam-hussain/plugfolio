import type { DiscoveryCreator } from "@plugfolio/core";
import Image from "next/image";
import Link from "next/link";

/**
 * A creator on Explore (v2, `Plugfolio v2.dc.html` §explore) — a compact row
 * card: the 46px avatar, the name, the handle, and the one number a shopper
 * came for (how many things are tagged behind it). Not a media card: the
 * page's photography belongs to posts and things; a creator is a door.
 */
export function CreatorCard({ creator }: { creator: DiscoveryCreator }) {
  const initial = creator.username.charAt(0).toUpperCase();
  return (
    <Link
      href={`/${creator.username}`}
      className="border-border bg-card rounded-tile hover:border-primary flex items-center gap-3 border p-3.5 no-underline transition-[transform,border-color] duration-150 hover:-translate-y-0.5"
    >
      <span className="bg-border-strong rounded-panel relative size-[46px] shrink-0 overflow-hidden">
        {creator.avatarUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image src={creator.avatarUrl} alt="" fill unoptimized className="object-cover" />
        ) : (
          <span className="text-primary font-display text-body grid size-full place-items-center font-bold">
            {initial}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="font-display text-copy block truncate font-semibold tracking-[-0.02em]">
          {creator.displayName ?? `@${creator.username}`}
        </span>
        {/* No display name means the handle IS the name — never both lines. */}
        {creator.displayName ? (
          <span className="text-muted-foreground text-label block truncate">
            @{creator.username}
          </span>
        ) : null}
        <span className="text-faint text-pico mt-[5px] block font-mono tracking-[0.06em]">
          {creator.productCount} {creator.productCount === 1 ? "thing" : "things"} tagged
        </span>
      </span>
    </Link>
  );
}
