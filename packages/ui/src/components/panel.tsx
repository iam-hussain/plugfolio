import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * The panel shell (DESIGN creator.html §.pn) — shared by the drawers and the
 * share modal. Header, an optional control row, a body that is the **only**
 * thing that scrolls, and a footer that stays put.
 *
 * The shells themselves are shadcn's `Sheet` and `Dialog` (§8: don't rebuild
 * what they give us). This is what goes inside them.
 *
 * Share is a modal, not a drawer, on purpose: a drawer stands *beside* the
 * page because you're still working on the page. Sharing is a errand you
 * finish and leave, so it takes the middle and gives the page back.
 */
export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex h-full flex-col", className)}>{children}</div>;
}

export function PanelHeader({
  title,
  onClose,
  children,
}: {
  title: React.ReactNode;
  /** Omit when the shell already draws its own close (shadcn Sheet does). */
  onClose?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-border flex items-center gap-3 border-b px-5 py-[18px]">
      <h2 className="font-display text-title font-extrabold tracking-[-0.02em]">{title}</h2>
      {children}
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="border-border bg-card text-muted-foreground hover:border-primary hover:text-primary rounded-pill ml-auto grid size-10 flex-none place-items-center border"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

/** The control row between header and body — sort chips, a "new" action. */
export function PanelControls({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-1.5 px-5 pb-1 pt-3.5">{children}</div>;
}

/** The only scrolling region, so the header and footer never move. */
export function PanelBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex-1 overflow-y-auto px-5 pb-5", className)}>{children}</div>;
}

/**
 * The foot. The bottom padding carries `env(safe-area-inset-bottom)` — without
 * it the composer sits under the home indicator on the phones most of our
 * traffic arrives on.
 */
export function PanelFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border flex flex-wrap items-center gap-2.5 border-t px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3.5">
      {children}
    </div>
  );
}
