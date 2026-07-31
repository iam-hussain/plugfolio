"use client";

import { Button } from "@plugfolio/ui";
import { useState } from "react";
import { SharePanel } from "./share-panel";

/**
 * One "Share" button, for the surfaces that share a single thing (DESIGN
 * post.html §.pc-act) rather than the whole page.
 *
 * The creator page uses `PageShare` instead — two *named* ways, because a
 * creator opening it there already knows whether they came for the link or
 * the code. On a post there is one thing to pass on and the modal's own mode
 * row is enough, so a second row of choices before the modal would be a fork
 * with nothing behind it.
 */
export type ShareButtonProps = {
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  /** The unfurl's second line — "5 products tagged". */
  meta: string;
  /** What gets shared: this post, not the creator's page. */
  path: string;
};

export function ShareButton({ handle, displayName, avatarUrl, meta, path }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"link" | "code">("link");

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Share
      </Button>
      <SharePanel
        handle={handle}
        displayName={displayName}
        avatarUrl={avatarUrl}
        meta={meta}
        path={path}
        mode={mode}
        onModeChange={setMode}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
