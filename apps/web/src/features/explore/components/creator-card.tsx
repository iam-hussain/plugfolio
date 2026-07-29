import type { DiscoveryCreator } from "@plugfolio/core";
import Image from "next/image";
import Link from "next/link";

/**
 * A creator card in the explore fan (DESIGN explore.html §.fc): a light card on
 * canvas — latest-post thumbnail, avatar + @handle, then "N posts · M things".
 * In the fan it tilts at rest and straightens on hover (the Straighten-On-Hover
 * rule); as the Creators results it's a plain wrapping grid cell (no tilt).
 */
export function CreatorCard({
  creator,
  index,
  layout,
}: {
  creator: DiscoveryCreator;
  index: number;
  layout: "fan" | "grid";
}) {
  const tilt = layout === "grid" ? "" : index % 2 === 0 ? "-rotate-2" : "rotate-[1.8deg]";
  const width = layout === "grid" ? "w-full" : "-mr-3.5 w-[152px] shrink-0 snap-center";

  return (
    <Link
      href={`/${creator.username}`}
      className={`bg-card shadow-rest rounded-card group/fc block p-2 no-underline transition-transform duration-300 ease-out hover:z-10 hover:-translate-y-2 hover:rotate-0 hover:shadow-lift ${tilt} ${width}`}
    >
      <div className="bg-muted rounded-image relative h-[108px] overflow-hidden">
        {creator.latestMediaUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image src={creator.latestMediaUrl} alt="" fill unoptimized className="object-cover" />
        ) : (
          <span className="text-muted-foreground font-display flex size-full items-center justify-center text-2xl font-bold">
            {creator.username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="flex items-center gap-2 px-1 pt-2.5 pb-0.5">
        <span className="bg-muted text-foreground grid size-6 shrink-0 place-items-center rounded-pill text-[10px] font-bold">
          {creator.username.charAt(0).toUpperCase()}
        </span>
        <span className="truncate text-[13px] font-bold">@{creator.username}</span>
      </span>
      <span className="text-muted-foreground block px-1 pb-1 text-[11px] font-semibold">
        {creator.postCount} posts · {creator.productCount} things
      </span>
    </Link>
  );
}
