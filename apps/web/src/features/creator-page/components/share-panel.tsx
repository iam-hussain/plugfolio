"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  ShareCard,
  ShareCopy,
  ShareMode,
  ShareModes,
  SharePanel as SharePanelShell,
  SharePlate,
  ShareQr,
  ShareWayTile,
  ShareWaysGrid,
  SocialGlyph,
} from "@plugfolio/ui";
import { Link2, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { qrMatrix } from "@/lib/qr";

/**
 * The creator's share modal (DESIGN creator.html §.sh).
 *
 * A modal, not a drawer: a drawer stands beside the page because you're still
 * working on the page, and sharing is an errand you finish and leave.
 *
 * Two modes, because a creator opens this already knowing which they came for
 * — the link to paste into a bio, or the code to hold up at a stall.
 */
export type SharePanelProps = {
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  /** "18 posts · 42 things" — the unfurl's second line. */
  meta: string;
  /** What gets shared. Defaults to the creator's page; a post shares itself. */
  path?: string;
  /** Which way they asked for — the panel opens already on it. */
  mode: "link" | "code";
  onModeChange: (mode: "link" | "code") => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SharePanel({
  handle,
  displayName,
  avatarUrl,
  meta,
  path,
  mode,
  onModeChange,
  open,
  onOpenChange,
}: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  // The origin is only knowable in the browser.
  const url =
    typeof window === "undefined" ? "" : `${window.location.origin}${path ?? `/${handle}`}`;

  const qr = useMemo(() => {
    if (!url || mode !== "code") return null;
    const matrix = qrMatrix(url);
    if (!matrix) return null;
    let d = "";
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix.length; x++) if (matrix[y]![x]) d += `M${x} ${y}h1v1h-1z`;
    }
    return { d, size: matrix.length };
  }, [url, mode]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogTitle>Share this page</DialogTitle>
        <DialogDescription className="sr-only">
          Copy the link to @{handle}, or show a code someone can point a camera at.
        </DialogDescription>

        <SharePanelShell>
          <ShareModes>
            <ShareMode selected={mode === "link"} onClick={() => onModeChange("link")}>
              Link
            </ShareMode>
            <ShareMode selected={mode === "code"} onClick={() => onModeChange("code")}>
              QR code
            </ShareMode>
          </ShareModes>

          {mode === "link" ? (
            <>
              <SharePlate
                prefix="plugfolio.com/"
                handle={handle}
                action={
                  <ShareCopy done={copied} onClick={copy}>
                    {copied ? "Copied" : "Copy"}
                  </ShareCopy>
                }
              />

              <ShareCard
                avatar={
                  <span className="bg-active text-primary rounded-pill text-micro grid size-[34px] flex-none place-items-center overflow-hidden font-bold">
                    {avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- preview of an unfurl, not page content */
                      <img src={avatarUrl} alt="" className="size-full object-cover" />
                    ) : (
                      handle.charAt(0).toUpperCase()
                    )}
                  </span>
                }
                name={displayName ?? `@${handle}`}
                meta={meta}
              />

              {/* Instagram first: the bio link is the one that matters, and
                  it's the one that needs the URL on the clipboard. */}
              <ShareWaysGrid>
                <ShareWayTile
                  icon={<SocialGlyph platform="instagram" />}
                  label="Paste in Instagram bio"
                  onClick={copy}
                />
                <ShareWayTile
                  icon={<SocialGlyph platform="tiktok" />}
                  label="Paste in TikTok bio"
                  onClick={copy}
                />
                <ShareWayTile icon={<Link2 />} label="Copy the link" onClick={copy} />
                {typeof navigator !== "undefined" && "share" in navigator ? (
                  <ShareWayTile
                    full
                    icon={<Share2 />}
                    label="Share another way"
                    onClick={() => void navigator.share({ url }).catch(() => {})}
                  />
                ) : null}
              </ShareWaysGrid>
            </>
          ) : qr ? (
            <ShareQr note={url}>
              <svg
                viewBox={`-2 -2 ${qr.size + 4} ${qr.size + 4}`}
                shapeRendering="crispEdges"
                role="img"
                aria-label={`QR code for @${handle}`}
                /* Ink from the token, not a literal — but deliberately the
                   *light*-theme ink either way: the plate under a QR is forced
                   white so a camera can read it, so the code must not follow
                   the viewer's theme into a dark-on-dark that won't scan. */
                className="text-brand-ink block size-full"
              >
                <path d={qr.d} fill="currentColor" />
              </svg>
            </ShareQr>
          ) : (
            <p className="text-muted-foreground text-copy">That address is too long for a code.</p>
          )}
        </SharePanelShell>
      </DialogContent>
    </Dialog>
  );
}
