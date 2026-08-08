import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";
import { measure } from "./measure";

/**
 * THE BACK ROOM (DESIGN styles.css §"THE BACK ROOM", dashboard.html) — the
 * dashboard shell, page scaffolding, cards and home vocabulary.
 *
 * Operate mode, not Express mode: dense rows, visible labels, edits that save
 * where you made them. None of it is ever seen by a shopper, which is why it
 * looks nothing like the public surface — the public page is a photograph with
 * a price pinned to it; this is a list you scan.
 *
 * Everything here is presentational (ADR-0018: shapes, never sources). Data
 * arrives as props, interactivity as slots.
 */

/** The underlined section tab across the top of the back room. */
const dashTab = cva(
  // v2 rail (ADR-0026): the active section fills with the card surface and
  // underlines in the accent; the rest sit quiet on the canvas.
  "text-label rounded-t-panel -mb-px inline-flex min-h-[44px] flex-none snap-start items-center gap-[7px] border-b-2 px-3.5 py-2.5 font-semibold hover:text-primary",
  {
    variants: {
      current: {
        true: "border-primary bg-card text-foreground",
        false: "text-muted-foreground border-transparent",
      },
    },
    defaultVariants: { current: false },
  },
);

/* ── The shell (§5.17) ─────────────────────────────────────────────────────
   Screens never invent their own header, which is only true if the header is
   one thing. */

/** Sticky brand bar + tab row. Every back-room page renders inside it. */
export function DashHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-background sticky top-0 z-40 border-b">
      <div className={measure()}>{children}</div>
    </div>
  );
}

/** The top row: mark hard left, profile switcher hard right. */
export function DashTop({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 py-3.5 [&>:first-child]:mr-auto">{children}</div>
  );
}

/**
 * Scrolls, never wraps: a wrapped tab row puts one tab on a line of its own,
 * where it reads as a stray control rather than the seventh of a set.
 */
export function DashTabs({ children }: { children: React.ReactNode }) {
  return (
    <nav
      aria-label="Dashboard sections"
      className="flex snap-x snap-proximity gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </nav>
  );
}

export function DashTab({
  current,
  className,
  asChild,
  ...props
}: React.ComponentProps<"a"> & { current?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      aria-current={current ? "page" : undefined}
      className={cn(dashTab({ current }), className)}
      {...props}
    />
  );
}

/** The centred column every back-room page body sits in. */
export function DashPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <main className={cn(measure(), className)}>{children}</main>;
}

/* ── Page header ───────────────────────────────────────────────────────────
   Eyebrow over title, optional action. Every tab uses it, which is what makes
   them feel like one product rather than seven screens. */

export function PageHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3.5 pt-6 sm:pt-8 lg:pt-[38px]">{children}</div>
  );
}

export function PageHeadTitle({
  eyebrow,
  children,
}: {
  eyebrow?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex-[1_1_260px]">
      {eyebrow ? (
        <p className="text-faint text-micro font-bold uppercase tracking-[0.07em]">{eyebrow}</p>
      ) : null}
      <h1 className="font-display text-name mt-[5px] font-extrabold leading-[1.1] tracking-[-0.03em]">
        {children}
      </h1>
    </div>
  );
}

export function PageHeadActions({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-none flex-wrap gap-2">{children}</div>;
}

/** The body below the header: generous top, generous bottom, nothing else. */
export function DashBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("pb-12 pt-6 sm:pt-8 lg:pb-[88px]", className)}>{children}</div>;
}

/* ── Cards, the back room's unit ───────────────────────────────────────────
   Distinct from shadcn's Card: this one is the operate-mode panel — a white
   lift on the canvas with the tile radius, stacked with a 14px rhythm. */

export function DashCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-border bg-card rounded-tile border p-4 sm:p-[22px] [&+&]:mt-3.5",
        "[&>*:last-child]:mb-0",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function DashCardHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3.5 flex flex-wrap items-baseline gap-x-3.5 gap-y-2", className)}>
      {children}
    </div>
  );
}

export function DashCardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-title font-extrabold tracking-[-0.02em]", className)}>{children}</h2>
  );
}

/** The count beside a card title ("3 of 5", "All time"). */
export function DashCardNote({ children }: { children: React.ReactNode }) {
  return <span className="text-faint text-micro">{children}</span>;
}

/** Pushes an action to the right of a card head. */
export function DashCardAction({ children }: { children: React.ReactNode }) {
  return <span className="ml-auto">{children}</span>;
}

/** A paragraph of explanation under a card title. */
export function Hint({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-muted-foreground text-copy mb-3.5 leading-[1.55]", className)}>
      {children}
    </p>
  );
}

/* ── Home: the active profile ─────────────────────────────────────────────*/

export function ActiveProfile({
  avatar,
  handle,
  url,
  action,
}: {
  avatar: React.ReactNode;
  handle: React.ReactNode;
  url: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {avatar}
      <span className="min-w-0 flex-[1_1_220px]">
        <b className="font-display text-title block font-extrabold tracking-[-0.02em]">{handle}</b>
        <span className="text-muted-foreground text-copy mt-[3px] block truncate">{url}</span>
      </span>
      {action}
    </div>
  );
}

/**
 * The nudge. It only exists when it has something to say, and it says the
 * number rather than a general encouragement — an always-present nudge is
 * wallpaper.
 */
export function Nudge({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-primary bg-active rounded-tile mt-3.5 flex flex-wrap items-center gap-3 border px-4 py-3.5">
      <p className="text-muted-foreground text-copy [&_b]:text-foreground m-0 flex-[1_1_240px]">
        {children}
      </p>
      {action}
    </div>
  );
}

/* ── Profile chips ────────────────────────────────────────────────────────*/

export function ProfileChips({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function ProfileChip({
  avatar,
  role,
  current,
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<"a"> & {
  avatar?: React.ReactNode;
  /** "manager" — shown only when the profile isn't the creator's own. */
  role?: React.ReactNode;
  current?: boolean;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      aria-current={current ? "true" : undefined}
      className={cn(
        "border-border bg-background text-foreground text-label rounded-pill inline-flex min-h-[44px] items-center gap-2 border py-[7px] pl-[7px] pr-3.5 font-semibold",
        "hover:border-primary",
        current && "border-primary shadow-[inset_0_0_0_1px_hsl(var(--color-primary))]",
        className,
      )}
      {...props}
    >
      {/* Slot clones ONE child; Slottable marks it, and the siblings become
          that child's children — so the avatar and the role stay in place. */}
      {avatar}
      <Slottable>{children}</Slottable>
      {role ? <em className="text-faint text-micro font-bold not-italic">{role}</em> : null}
    </Comp>
  );
}

/* ── Connections (§5.15) ──────────────────────────────────────────────────*/

export function Connections({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

export function Connection({
  icon,
  name,
  status,
  action,
  channels,
}: {
  icon: React.ReactNode;
  name: React.ReactNode;
  status: React.ReactNode;
  action?: React.ReactNode;
  /**
   * What the provider exposes. A Google account can carry several YouTube
   * channels, and that pool is what usernames come from.
   */
  channels?: React.ReactNode;
}) {
  return (
    <div className="border-border bg-background rounded-tile flex flex-wrap items-center gap-3 border px-4 py-[15px]">
      <span className="bg-card border-border text-muted-foreground rounded-pill grid size-10 flex-none place-items-center border [&_svg]:size-[19px]">
        {icon}
      </span>
      <span className="min-w-0 flex-[1_1_160px]">
        <b className="text-label block font-bold">{name}</b>
        <span className="text-muted-foreground text-micro mt-0.5 block">{status}</span>
      </span>
      {action}
      {channels ? (
        <span className="border-border mt-0.5 flex flex-[1_0_100%] flex-wrap gap-2 border-t pt-3">
          {channels}
        </span>
      ) : null}
    </div>
  );
}

export function ConnectionChannel({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-card border-border text-muted-foreground text-micro rounded-pill inline-flex items-center gap-[7px] border px-[11px] py-[5px] font-semibold">
      {children}
    </span>
  );
}

/**
 * "Connected as Maya Rao". The dot is lime because a live connection is a real
 * state worth flagging, and it is a fill under ink — never lime type (§7).
 */
export function ConnectedAs({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-foreground text-micro inline-flex items-center gap-1.5 font-bold">
      <span className="bg-accent rounded-pill size-2 flex-none" aria-hidden />
      {children}
    </span>
  );
}
