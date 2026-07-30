import * as React from "react";
import { cn } from "../lib/cn";

/**
 * The share panel (DESIGN creator.html §.sh) — the contents of the share
 * modal.
 *
 * Two modes rather than one long scroll, because a creator opens this already
 * knowing which of the two they came for: the link, or the code.
 */
export function SharePanel({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-[18px]">{children}</div>;
}

export function ShareModes({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="tablist"
      className="border-border bg-card rounded-image flex gap-[3px] border p-[3px]"
    >
      {children}
    </div>
  );
}

export function ShareMode({
  selected,
  className,
  ...props
}: React.ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={cn(
        "rounded-nest text-micro min-h-[38px] flex-1 border-0 bg-transparent font-bold",
        selected ? "bg-foreground text-background" : "text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The URL, with the handle picked out — the part that's actually theirs, and
 * the part they'll read back to check.
 */
export function SharePlate({
  prefix,
  handle,
  action,
}: {
  prefix: string;
  handle: string;
  action: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card flex items-center gap-2.5 rounded-pill border py-1.5 pl-4 pr-1.5">
      <span className="text-label min-w-0 flex-1 truncate font-semibold tracking-[0.01em]">
        {prefix}
        <b className="text-primary font-bold">{handle}</b>
      </span>
      {action}
    </div>
  );
}

/** The copy control. Lime once it's done — a real thing just happened. */
export function ShareCopy({
  done,
  className,
  ...props
}: React.ComponentProps<"button"> & { done?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "text-micro min-h-10 flex-none rounded-pill border-0 px-4 py-2.5 font-bold",
        done ? "bg-accent text-accent-foreground" : "bg-foreground text-background",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The unfurl preview — built from the page's **own** avatar, name and counts,
 * so it can't drift from what actually renders when someone pastes the link.
 */
export function ShareCard({
  cover,
  avatar,
  name,
  meta,
}: {
  cover?: React.ReactNode;
  avatar: React.ReactNode;
  name: React.ReactNode;
  meta: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card rounded-tile overflow-hidden border">
      <div className="bg-active h-24 w-full overflow-hidden">{cover}</div>
      <div className="flex items-center gap-2.5 px-[13px] py-[11px]">
        {avatar}
        <span className="min-w-0">
          <b className="text-label block truncate font-bold">{name}</b>
          <span className="text-muted-foreground text-micro block truncate">{meta}</span>
        </span>
      </div>
    </div>
  );
}

/**
 * Where it goes. Instagram first, deliberately: the bio link is the one that
 * matters, and it's the one that needs the URL on the clipboard first.
 */
export function ShareWaysGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

export function ShareWayTile({
  icon,
  label,
  full,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  icon?: React.ReactNode;
  label: React.ReactNode;
  /** The native share sheet spans both columns when the device has one. */
  full?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "border-border bg-card text-foreground rounded-image hover:border-primary hover:text-primary",
        "flex min-h-[52px] items-center gap-2.5 border px-[13px] py-2.5 text-left transition-colors [&_svg]:size-[18px] [&_svg]:flex-none",
        full && "col-span-2",
        className,
      )}
      {...props}
    >
      {icon}
      <span className="text-micro font-bold">{label}</span>
    </button>
  );
}

/**
 * The code. For a phone held up at a market stall or filmed into a story — the
 * one share that needs no clipboard at all.
 */
export function ShareQr({ children, note }: { children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="border-border rounded-tile grid justify-items-center gap-3 border border-dashed p-[22px]">
      <div className="rounded-image w-[min(220px,60vw)] bg-white p-2">{children}</div>
      {note ? (
        <p className="text-faint text-micro m-0 text-center">{note}</p>
      ) : null}
    </div>
  );
}
