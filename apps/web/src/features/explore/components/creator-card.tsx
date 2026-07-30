import type { DiscoveryCreator } from "@plugfolio/core";
import { CreatorCard as Card } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";

/**
 * A creator in the explore fan (DESIGN explore.html §.fc). The card shape is
 * the design system's; this turns a discovery row into its props.
 *
 * In the rail it tilts and overlaps; scoped to Creators it becomes a plain grid
 * cell — a rail says "there is more sideways", a result set has to say "this is
 * the set".
 */
export function CreatorCard({
  creator,
  layout,
}: {
  creator: DiscoveryCreator;
  layout: "fan" | "grid";
}) {
  return (
    <Card
      asChild
      layout={layout === "fan" ? "rail" : "grid"}
      handle={`@${creator.username}`}
      meta={`${creator.postCount} posts · ${creator.productCount} things`}
      cover={
        creator.latestMediaUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image
            src={creator.latestMediaUrl}
            alt=""
            width={304}
            height={216}
            unoptimized
            className="size-full object-cover"
          />
        ) : null
      }
      avatar={
        <span className="bg-active text-primary grid size-6 flex-none place-items-center rounded-pill text-[11px] font-bold">
          {creator.username.charAt(0).toUpperCase()}
        </span>
      }
    >
      <Link href={`/${creator.username}`} />
    </Card>
  );
}
