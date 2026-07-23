import Image from "next/image";
import { formatCount } from "@/lib/format-count";
import { SocialsRow, type SocialLink } from "./socials-row";

/**
 * Creator page header (design-out creator page): a 96px rounded tile beside
 * the Sora display name, mono "@handle · N followers" line, optional bio and
 * the socials row; `action` (Follow / owner tools) sits on the right.
 * Presentational; data fetching lives in the page.
 */
export type CreatorHeaderProps = {
  handle: string;
  followerCount: number;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  /** Socials authored in dashboard Settings → "Your links". */
  socials?: SocialLink[];
  /** Right-hand slot: Follow for visitors, owner tools for the creator. */
  action?: React.ReactNode;
};

export function CreatorHeader({
  handle,
  followerCount,
  displayName,
  avatarUrl,
  bio,
  socials = [],
  action,
}: CreatorHeaderProps) {
  const name = displayName ?? handle;

  return (
    <header className="flex flex-wrap items-start gap-5 pt-[30px]">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-[20px]">
        {avatarUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image src={avatarUrl} alt="" fill unoptimized className="object-cover" />
        ) : (
          <span className="bg-primary/10 text-primary font-display flex size-full items-center justify-center text-4xl font-extrabold">
            {name.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-[240px] flex-1">
        <h1 className="font-display text-primary text-[28px] font-extrabold tracking-[-0.03em]">
          {name}
        </h1>
        <p className="text-muted-foreground mt-1 font-mono text-xs">
          @{handle} ·{" "}
          <span className="text-foreground font-bold">{formatCount(followerCount)}</span> followers
        </p>
        {bio ? (
          <p className="text-muted-foreground mt-3 max-w-[520px] text-[14.5px] leading-[1.55]">
            {bio}
          </p>
        ) : null}
        <SocialsRow links={socials} className="pt-3.5" />
      </div>
      {action ? <div className="flex flex-col items-end gap-2.5">{action}</div> : null}
    </header>
  );
}
