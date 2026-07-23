import type { DiscoveryCreator } from "@plugfolio/core";
import Image from "next/image";
import Link from "next/link";
import { formatCount } from "@/lib/format-count";

/**
 * Discovery creator card (design-out discover): thumbnail tile, Sora name,
 * mono meta, follower count and a "View →" that opens the shoppable page.
 */
export function CreatorCard({ creator }: { creator: DiscoveryCreator }) {
  return (
    <Link
      href={`/${creator.username}`}
      className="border-border bg-background hover:bg-muted/60 block rounded-2xl border p-[18px] transition-colors"
    >
      <div className="flex items-center gap-[13px]">
        <div className="relative size-[52px] shrink-0 overflow-hidden rounded-[14px]">
          {creator.latestMediaUrl ? (
            /* ponytail: unoptimized until the social-import pipeline pins image domains */
            <Image
              src={creator.latestMediaUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="bg-primary/10 text-primary font-display flex size-full items-center justify-center text-xl font-bold">
              {creator.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-base font-bold">{creator.username}</p>
          <p className="text-muted-foreground mt-0.5 truncate font-mono text-[11px]">
            @{creator.username} · {creator.postCount} posts · {creator.productCount} products
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
        <span className="text-muted-foreground/70 font-mono text-[11px]">
          {formatCount(creator.followerCount)} followers
        </span>
        <span className="text-primary whitespace-nowrap text-[13px] font-semibold">View →</span>
      </div>
    </Link>
  );
}
