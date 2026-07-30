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
};

export function PageShare({ handle, displayName, avatarUrl, meta }: PageShareProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"link" | "code">("link");

  const openOn = (next: "link" | "code") => {
    setMode(next);
    setOpen(true);
  };

  return (
    <>
      <ShareWays>
        <ShareWay icon={<Link2 />} onClick={() => openOn("link")}>
          Link
        </ShareWay>
        <ShareWay icon={<QrCode />} onClick={() => openOn("code")}>
          QR
        </ShareWay>
      </ShareWays>
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
