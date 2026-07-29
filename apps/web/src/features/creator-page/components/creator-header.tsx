import Image from "next/image";
import { formatCount } from "@/lib/format-count";
import { SocialsRow, type SocialLink } from "./socials-row";

/**
 * Creator page header (DESIGN creator.html §.ch): a cover band with the big
 * round avatar overlapping it, then the Sora display name, "@handle ·
 * N followers", the bio, the socials row and a "Share this page" pair. The
 * `action` slot (Follow for visitors, owner tools for the creator) sits on the
 * right; the buy path below is identical for every viewer. Presentational —
 * data fetching lives in the page.
 */
export type CreatorHeaderProps = {
  handle: string;
  followerCount: number;
  displayName?: string;
  avatarUrl?: string;
  /** No upload infra in v1 — null falls back to a violet-wash band. */
  coverUrl?: string;
  bio?: string;
  /** Socials authored in dashboard Settings → "Your links". */
  socials?: SocialLink[];
  /** The "Share this page" control — shown to every viewer. */
  share?: React.ReactNode;
  /** Right-hand slot: Follow for visitors, owner tools for the creator. */
  action?: React.ReactNode;
};

export function CreatorHeader({
  handle,
  followerCount,
  displayName,
  avatarUrl,
  coverUrl,
  bio,
  socials = [],
  share,
  action,
}: CreatorHeaderProps) {
  const name = displayName ?? handle;

  return (
    <header>
      {/* ── cover ── */}
      <div className="bg-active relative h-[112px] overflow-hidden sm:h-[168px]">
        {coverUrl ? (
          /* ponytail: unoptimized until the social-import pipeline pins image domains */
          <Image src={coverUrl} alt="" fill unoptimized className="object-cover" />
        ) : null}
        {/* Canvas fades up so the header never sits on unpredictable pixels. */}
        <div
          aria-hidden
          className="from-brand-ink/10 to-background absolute inset-0 bg-gradient-to-b via-transparent"
        />
      </div>

      {/* ── identity, overlapping the cover ── */}
      <div className="-mt-[34px] flex flex-wrap items-start gap-4 px-1 sm:-mt-11">
        <div className="ring-background bg-active relative size-[68px] shrink-0 overflow-hidden rounded-pill ring-[3px] sm:size-[88px] sm:ring-4">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill unoptimized className="object-cover" />
          ) : (
            <span className="text-brand-violet-deep font-display flex size-full items-center justify-center text-3xl font-extrabold">
              {name.trim().charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-[240px] flex-1 pt-[38px] sm:pt-12">
          <h1 className="font-display text-2xl font-extrabold leading-[1.05] tracking-[-0.03em]">
            {name}
          </h1>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-muted-foreground text-sm font-semibold">@{handle}</span>
            <span className="text-faint" aria-hidden>
              ·
            </span>
            <span className="text-sm font-bold tabular-nums">
              {formatCount(followerCount)}{" "}
              <span className="text-muted-foreground font-medium">followers</span>
            </span>
          </div>
          {bio ? (
            <p className="text-muted-foreground mt-3 max-w-[58ch] text-[0.9375rem] leading-[1.55]">
              {bio}
            </p>
          ) : null}
          <SocialsRow links={socials} className="pt-3.5" />
          {share ? (
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="text-faint text-xs font-semibold uppercase tracking-[0.06em]">
                Share this page
              </span>
              {share}
            </div>
          ) : null}
        </div>

        {action ? (
          <div className="flex flex-col items-end gap-2.5 pt-3.5 max-sm:w-full max-sm:items-stretch sm:pt-12">
            {action}
          </div>
        ) : null}
      </div>
    </header>
  );
}
