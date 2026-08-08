import type { CreatorPage } from "@plugfolio/core";
import { Button, cn, CreatorCover, measure, PageBand } from "@plugfolio/ui";
import Link from "next/link";
import type { ReactNode } from "react";
import { PillNavDivider, PillNavOverride, pillNavCircle } from "@/components/chrome/pill-nav";
import { RequestCollabForm } from "@/features/business-collab";
import { PageShare } from "./page-share";

/**
 * The section pieces of the creator page (DESIGN creator.html), split out of
 * `CreatorPageView` so that surface is composition: the pill-nav override, the
 * cover, and the two viewer-specific bands (anon / business). Server Components.
 */

/** The pill nav morphs into this page's verbs (ADR-0026 §6): the way back to
 * Explore, Follow (or the owner's Dashboard), and Share. */
export function CreatorPageNav({
  page,
  membership,
  follow,
  postsCount,
  thingsCount,
}: {
  page: CreatorPage;
  membership: { id: string; role: string } | null;
  follow: ReactNode;
  postsCount: number;
  thingsCount: number;
}) {
  return (
    <PillNavOverride>
      <Link
        href="/explore"
        className="text-nav-foreground text-pico tracking-eyebrow flex items-center gap-2 pl-2 font-mono font-bold uppercase"
      >
        <span aria-hidden>←</span> Explore
      </Link>
      <PillNavDivider />
      {membership ? (
        <Button variant="action" className="px-5" asChild>
          <Link href={{ pathname: "/dashboard", query: { profile: page.id } }}>Dashboard</Link>
        </Button>
      ) : (
        follow
      )}
      <PageShare
        handle={page.username}
        displayName={page.displayName}
        avatarUrl={page.avatarUrl}
        meta={`${postsCount} posts · ${thingsCount} things`}
        trigger="circle"
        className={pillNavCircle}
      />
    </PillNavOverride>
  );
}

/** The cover: band and none run edge to edge above the measure; the tile
 * treatment sits inside it (v2 §Layout). */
export function CreatorPageCover({
  page,
  cover,
  thingsCount,
}: {
  page: CreatorPage;
  cover: CreatorPage["coverStyle"];
  thingsCount: number;
}) {
  if (cover === "tile") {
    return (
      <div className={cn(measure(), "pt-3")}>
        <CreatorCover
          treatment="tile"
          tall={page.headerStyle === "centred"}
          url={page.coverUrl}
          badge={thingsCount > 0 ? `${thingsCount} things live` : null}
        />
      </div>
    );
  }
  return (
    <CreatorCover
      treatment={cover}
      tall={page.headerStyle === "centred"}
      url={page.coverUrl}
      greeting={page.greeting}
    />
  );
}

/** The anon band (v2): shopping never needs an account — say it once, quietly,
 * with the one door for follow/comment. */
export function AnonBand() {
  return (
    <div className="border-border bg-card rounded-row mb-4 flex flex-wrap items-center justify-between gap-3 border px-4 py-3.5">
      <p className="text-muted-foreground text-label leading-normal">
        Shopping this page never needs an account.{" "}
        <b className="text-foreground font-semibold">Sign in only to follow or comment.</b>
      </p>
      <Button variant="secondary" size="sm" asChild>
        <Link href="/signin">Sign in</Link>
      </Button>
    </div>
  );
}

/** A band that belongs to one viewer only (v2 §.band-biz): accent border, the
 * one collab door. */
export function BusinessBand({ profileId }: { profileId: string }) {
  return (
    <PageBand layout="stack" className="border-primary">
      <p className="text-primary text-pico tracking-eyebrow pb-2 font-mono font-bold uppercase">
        You own a business
      </p>
      <RequestCollabForm profileId={profileId} />
    </PageBand>
  );
}
