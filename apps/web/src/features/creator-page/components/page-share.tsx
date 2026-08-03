"use client";

import { ShareWay, ShareWays } from "@plugfolio/ui";
import { Link2, QrCode } from "lucide-react";
import { useState } from "react";
import { SharePanel } from "./share-panel";

/**
 * "Share this page · Link · QR" under the creator's identity (DESIGN
 * creator.html §.pshare), plus the modal both ways open.
 *
 * Two *named* ways rather than one verb: "Share" alone made a visitor guess
 * what would happen — Link and QR each say it, and each opens the panel
 * already on the mode they asked for, so nobody lands on a tab they have to
 * switch away from.
 */
export type PageShareProps = {
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  meta: string;
  /**
   * v2 (ADR-0026): `pill` is the header's accent "Share · QR"; `circle` is the
   * bare icon circle the morphing pill nav uses; `ways` keeps the two named
   * ways for surfaces that still want them.
   */
  trigger?: "pill" | "circle" | "ways";
  /** Extra classes on the trigger (the nav circle passes its shell). */
  className?: string;
};

export function PageShare({
  handle,
  displayName,
  avatarUrl,
  meta,
  trigger = "pill",
  className,
}: PageShareProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"link" | "code">("link");

  const openOn = (next: "link" | "code") => {
    setMode(next);
    setOpen(true);
  };

  return (
    <>
      {trigger === "pill" ? (
        <button
          type="button"
          onClick={() => openOn("link")}
          className={
            className ??
            "bg-primary text-primary-foreground text-pico tracking-eyebrow rounded-pill inline-flex h-[34px] items-center gap-[7px] px-3.5 font-mono font-bold uppercase transition-transform hover:-translate-y-px"
          }
        >
          <Link2 aria-hidden className="size-[13px]" strokeWidth={2.2} />
          Share · QR
        </button>
      ) : trigger === "circle" ? (
        <button
          type="button"
          aria-label="Share this page"
          onClick={() => openOn("link")}
          className={className}
        >
          <Link2 aria-hidden className="size-[17px]" strokeWidth={2} />
        </button>
      ) : (
        <ShareWays>
          <ShareWay icon={<Link2 />} onClick={() => openOn("link")}>
            Link
          </ShareWay>
          <ShareWay icon={<QrCode />} onClick={() => openOn("code")}>
            QR
          </ShareWay>
        </ShareWays>
      )}
      <SharePanel
        handle={handle}
        displayName={displayName}
        avatarUrl={avatarUrl}
        meta={meta}
        mode={mode}
        onModeChange={setMode}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
