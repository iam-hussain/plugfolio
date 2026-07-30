"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@plugfolio/ui";
import { QrCode } from "lucide-react";
import { useMemo, useState } from "react";
import { qrMatrix } from "@/lib/qr";

/**
 * The page's QR code (DESIGN creator.html: "Share this page · Link · QR").
 * The point is the in-person hand-off — a creator holds their phone up at a
 * market stall or a meet-up and the page opens.
 *
 * It encodes for real (`@/lib/qr`, decoder-tested): a decorative grid of
 * squares that doesn't scan would fail in exactly the moment this exists for.
 * Drawn as one SVG path so it stays crisp at any size and prints cleanly.
 */
export function QrButton({ path, label }: { path: string; label: string }) {
  const [open, setOpen] = useState(false);
  // The origin is only knowable in the browser, so the matrix is built when
  // the dialog opens rather than on the server.
  const [url, setUrl] = useState("");

  const svgPath = useMemo(() => {
    if (!url) return null;
    const matrix = qrMatrix(url);
    if (!matrix) return null;
    let d = "";
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix.length; x++) {
        if (matrix[y]![x]) d += `M${x} ${y}h1v1h-1z`;
      }
    }
    return { d, size: matrix.length };
  }, [url]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setUrl(`${window.location.origin}${path}`);
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-pill px-5">
          <QrCode className="size-4" />
          QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Point a camera at this</DialogTitle>
          <DialogDescription>It opens {label} — no app, no account.</DialogDescription>
        </DialogHeader>
        {svgPath ? (
          <div className="flex flex-col items-center gap-3">
            {/* Quiet zone included in the viewBox — a code with no margin
                doesn't scan, and the margin has to be white, not Canvas. */}
            <svg
              viewBox={`-2 -2 ${svgPath.size + 4} ${svgPath.size + 4}`}
              shapeRendering="crispEdges"
              role="img"
              aria-label={`QR code for ${label}`}
              className="rounded-image size-[240px] max-w-full bg-white p-1"
            >
              <path d={svgPath.d} fill="#12101C" />
            </svg>
            <p className="text-muted-foreground break-all text-center text-xs">{url}</p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">That address is too long for a code.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
