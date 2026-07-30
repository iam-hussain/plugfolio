import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

/**
 * THE BACK ROOM (DESIGN styles.css §"THE BACK ROOM", dashboard.html) — the
 * creator's dashboard, post editor and product editor.
 *
 * Operate mode, not Express mode: dense rows, visible labels, edits that save
 * where you made them. None of it is ever seen by a shopper, which is why it
 * looks nothing like the public surface — the public page is a photograph with
 * a price pinned to it; this is a list you scan.
 *
 * Everything here is presentational (ADR-0018: shapes, never sources). Data
 * arrives as props, interactivity as slots.
 */

/* ── The shell (§5.17) ─────────────────────────────────────────────────────
   Screens never invent their own header, which is only true if the header is
   one thing. */

/** Sticky brand bar + tab row. Every back-room page renders inside it. */
export function DashHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-background sticky top-0 z-40 border-b">
      <div className="mx-auto w-full max-w-inner px-5 lg:px-10">{children}</div>
    </div>
  );
}

/** The top row: mark hard left, profile switcher hard right. */
export function DashTop({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3.5 py-3.5 [&>:first-child]:mr-auto">{children}</div>;
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
      className={cn(
        "text-label -mb-px inline-flex flex-none snap-start items-center rounded-t-image border-b-2 px-3.5 py-2.5 font-semibold",
        "min-h-[44px] hover:text-primary",
        current
          ? "border-primary text-foreground font-bold"
          : "text-muted-foreground border-transparent",
        className,
      )}
      {...props}
    />
  );
}

/** The centred column every back-room page body sits in. */
export function DashPage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("mx-auto w-full max-w-inner px-5 lg:px-10", className)}>{children}</main>;
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
export function DashBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("pt-6 pb-12 sm:pt-8 lg:pb-[88px]", className)}>{children}</div>;
}

/* ── Cards, the back room's unit ───────────────────────────────────────────
   Distinct from shadcn's Card: this one is the operate-mode panel — a white
   lift on the canvas with the tile radius, stacked with a 14px rhythm. */

export function DashCard({ children, className }: { children: React.ReactNode; className?: string }) {
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
export function Nudge({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="border-primary bg-active rounded-tile mt-3.5 flex flex-wrap items-center gap-3 border px-4 py-3.5">
      <p className="text-muted-foreground text-copy m-0 flex-[1_1_240px] [&_b]:text-foreground">
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
      <span className="bg-card border-border text-muted-foreground grid size-10 flex-none place-items-center rounded-pill border [&_svg]:size-[19px]">
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
      <span className="bg-accent size-2 flex-none rounded-pill" aria-hidden />
      {children}
    </span>
  );
}

/* ── Filters ──────────────────────────────────────────────────────────────*/

export function Filters({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex gap-2 overflow-x-auto">{children}</div>;
}

export function FilterButton({
  current,
  count,
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<"a"> & { current?: boolean; count?: React.ReactNode; asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      aria-current={current ? "true" : undefined}
      className={cn(
        "text-micro rounded-pill inline-flex min-h-10 flex-none items-center border px-4 py-2.5 font-bold",
        current
          ? "bg-foreground border-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
        className,
      )}
      {...props}
    >
      <Slottable>{children}</Slottable>
      {count !== undefined ? <b className="ml-1.5 font-extrabold">{count}</b> : null}
    </Comp>
  );
}

/* ── Pills ────────────────────────────────────────────────────────────────
   The small state badge a dense row carries. `untagged`, `new` and `code` are
   lime, and only those three: each marks a real live thing — work waiting, a
   reply owed, an offer running (§7 lime-means-offer). */

const pillVariants = cva(
  "text-micro rounded-pill inline-flex items-center px-[9px] py-[3px] font-bold",
  {
    variants: {
      tone: {
        shelf: "bg-active text-brand-violet-deep",
        own: "bg-active text-brand-violet-deep",
        agreed: "bg-active text-brand-violet-deep",
        code: "bg-accent text-accent-foreground",
        untagged: "bg-accent text-accent-foreground",
        new: "bg-accent text-accent-foreground",
        none: "bg-border text-muted-foreground",
        closed: "bg-border text-muted-foreground",
      },
    },
    defaultVariants: { tone: "none" },
  },
);

export function Pill({
  tone,
  className,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof pillVariants>) {
  return <span className={cn(pillVariants({ tone }), className)} {...props} />;
}

/* ── Icon actions ─────────────────────────────────────────────────────────
   A dense list repeats its verbs on every row, and spelled out they become the
   loudest thing on the page — eight "Edit product" buttons shouting over eight
   product names. As glyphs they recede to where a repeated control belongs.

   Every one carries a real label: `aria-label` for screen readers, `title` for
   a hover tooltip. An icon-only control without both is a guess. */

const iconActionVariants = cva(
  "inline-grid size-9 flex-none place-items-center rounded-pill border border-transparent p-0 transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4",
  {
    variants: {
      tone: {
        default: "text-faint hover:bg-active hover:text-primary",
        danger: "text-faint hover:border-destructive hover:text-destructive",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export type IconActionProps = React.ComponentProps<"button"> &
  VariantProps<typeof iconActionVariants> & {
    /** Required — an icon-only control has to say what it does. */
    label: string;
    asChild?: boolean;
  };

export function IconAction({ tone, label, className, asChild, ...props }: IconActionProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : "button"}
      aria-label={label}
      title={label}
      className={cn(iconActionVariants({ tone }), className)}
      {...props}
    />
  );
}

export function IconActions({ children }: { children: React.ReactNode }) {
  return <span className="flex flex-none items-center gap-0.5">{children}</span>;
}

/**
 * The small secondary action in a dense row. Works as both a `<button>` and an
 * `<a>` — as a link it kept the underline and the link colour, which is why
 * "Edit product" looked like body copy that had gone wrong.
 */
export function MiniButton({
  danger,
  className,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { danger?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : "button"}
      className={cn(
        "border-border bg-background text-muted-foreground text-micro rounded-pill inline-flex min-h-9 items-center gap-1.5 border px-3 py-2 font-bold no-underline [&_svg]:size-3.5",
        danger
          ? "hover:border-destructive hover:text-destructive"
          : "hover:border-primary hover:text-primary",
        className,
      )}
      {...props}
    />
  );
}

/* ── Fields (§5.23) ───────────────────────────────────────────────────────
   The Admin/Manager boundary is SHOWN, never silently hidden: a Manager sees
   the field, sees the label saying it is Admin-only, and sees it disabled.
   Hiding it would leave them wondering what they are missing. */

/** A field carries its own bottom rhythm, so a stack of them spaces itself. */
export function DashField({
  label,
  hint,
  note,
  htmlFor,
  children,
  className,
}: {
  label: React.ReactNode;
  /** "· Admin only" — set in the accent, appended to the label. */
  hint?: React.ReactNode;
  /** The line under the control ("Uploads are not in v1."). */
  note?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3.5 grid gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-faint text-micro font-bold uppercase tracking-[0.06em]"
      >
        {label}
        {hint ? <i className="text-primary not-italic"> {hint}</i> : null}
      </label>
      {children}
      {note ? <span className="text-faint text-micro">{note}</span> : null}
    </div>
  );
}

/**
 * Two fields abreast. The grid owns the gap and the field stands down — the
 * field's own margin landed ON TOP of the gap, so two-column rows sat 28px
 * apart while single-column rows sat 14px.
 */
export function DashFieldPair({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-3.5 md:grid-cols-2 [&>*]:mb-0", className)}>
      {children}
    </div>
  );
}

/**
 * An inline row of controls that ends in a button — search, add-a-shelf,
 * invite. A `div`, because these rows appear *inside* forms as often as they
 * are one; a nested `<form>` is invalid HTML and the browser silently drops it,
 * which shows up as a hydration mismatch rather than as anything readable.
 */
export function DashFieldRow({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("mt-3 flex flex-wrap gap-2", className)} {...props}>
      {children}
    </div>
  );
}

/** The same row when it IS the form — a search box, an invite, an add. */
export function DashFieldForm({
  children,
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("mt-3 flex flex-wrap gap-2", className)} {...props}>
      {children}
    </form>
  );
}

/** The uppercase micro label above a field row. */
export function DashFieldRowLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-faint text-micro -mb-1 mt-0.5 flex-[1_0_100%] font-bold uppercase tracking-[0.06em]">
      {children}
    </span>
  );
}

/* ── Managers (§5.23) ─────────────────────────────────────────────────────*/

export function ManagerRow({
  name,
  email,
  action,
}: {
  name: React.ReactNode;
  email: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-border bg-background rounded-tile flex flex-wrap items-center gap-3 border px-3.5 py-3 [&+&]:mt-2">
      <span className="min-w-0 flex-[1_1_200px]">
        <b className="text-label block font-bold">{name}</b>
        <span className="text-muted-foreground text-micro block">{email}</span>
      </span>
      {action}
    </div>
  );
}

/* ── The one destructive action ───────────────────────────────────────────
   Dashed, like an empty state: it marks a boundary rather than a card. */

export function DangerZone({
  title,
  children,
  action,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <div className="border-border rounded-tile border border-dashed px-5 py-[18px]">
      <b className="text-destructive text-label block font-bold">{title}</b>
      <p className="text-muted-foreground text-copy mt-1.5 mb-3.5 max-w-[56ch]">{children}</p>
      {action}
    </div>
  );
}
