"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PAGE_CONTEXT_SLOT } from "@/components/chrome/page-context-slot";

/**
 * Past the header, the top bar stops being Plugfolio's and becomes the
 * creator's (DESIGN creator.html §.ctx).
 *
 * Scroll far enough down a long wall of tiles and the only thing telling you
 * whose page you are on is the URL — and the action you might want (Follow,
 * or the owner's Customise) is a scroll back up. So the bar picks it up.
 *
 * It portals into the shared bar's one page-owned slot rather than drawing a
 * second bar under it: two stacked bars would eat the top of every phone
 * screen to say one thing.
 */
export type CreatorContextBarProps = {
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  /** Follow for a visitor, Customise for the owner — the header's action. */
  action?: React.ReactNode;
  /**
   * Where the name jumps to. On a product/post page pass the creator's page so
   * the name takes you there; on the creator page itself omit it — you're
   * already there, so the name scrolls back to the top instead.
   */
  href?: Route;
  /** Scroll distance (px) that hands the bar over. Default clears the creator
   * cover band; a detail page's byline sits higher, so it passes less. */
  revealAfter?: number;
};

export function CreatorContextBar({
  handle,
  displayName,
  avatarUrl,
  action,
  href,
  revealAfter = 190,
}: CreatorContextBarProps) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [past, setPast] = useState(false);

  useEffect(() => setSlot(document.getElementById(PAGE_CONTEXT_SLOT)), []);

  useEffect(() => {
    // A scroll offset, not an observer on the header: the header is the thing
    // being replaced, and watching it makes the bar flicker while the header
    // is half on screen.
    const onScroll = () => setPast(window.scrollY > revealAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [revealAfter]);

  if (!slot) return null;

  const name = displayName ?? `@${handle}`;

  const identity = (
    <>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- an avatar already fetched by the header below; Image would re-request it
        <img src={avatarUrl} alt="" className="rounded-pill size-[30px] shrink-0 object-cover" />
      ) : (
        <span className="bg-active text-primary rounded-pill text-micro grid size-[30px] shrink-0 place-items-center font-extrabold">
          {name.replace("@", "").charAt(0).toUpperCase()}
        </span>
      )}
      <span className="grid min-w-0 text-left leading-[1.15]">
        <b className="text-micro lg:text-label truncate font-bold">{name}</b>
        {displayName ? (
          <i className="text-muted-foreground text-micro truncate font-semibold not-italic">
            @{handle}
          </i>
        ) : null}
      </span>
    </>
  );

  // Off the creator page the name links to it; on it, there's nowhere to go —
  // scroll back to the top (respecting reduced-motion).
  const clickable = "flex min-w-0 items-center gap-2 lg:gap-2.5";
  const target = href ? (
    <Link href={href} className={clickable}>
      {identity}
    </Link>
  ) : (
    <button
      type="button"
      className={clickable}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
    >
      {identity}
    </button>
  );

  return createPortal(
    <div
      data-past={past ? "" : undefined}
      className="ease-design ml-2 flex min-w-0 translate-y-1.5 items-center gap-2 opacity-0 transition-[opacity,transform] duration-200 data-[past]:translate-y-0 data-[past]:opacity-100 motion-reduce:transition-none lg:ml-3.5 lg:gap-2.5"
      // Hidden from everything, not just from sight, until it is the bar.
      aria-hidden={past ? undefined : "true"}
      inert={past ? undefined : true}
    >
      {target}
      {action}
    </div>,
    slot,
  );
}
