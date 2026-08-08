import * as React from "react";
import { cn } from "../lib/cn";

/**
 * THE BACK ROOM (DESIGN styles.css §"THE BACK ROOM") — the settings/editor
 * form vocabulary: fields, the manager list, and the one destructive action.
 * Presentational (ADR-0018): data in, interactivity as slots.
 */

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
  /** The line under the control (e.g. "Upload a photo, or paste an image URL."). */
  note?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3.5 grid gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-faint text-pico tracking-eyebrow font-mono font-bold uppercase"
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
export function DashFieldPair({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-3.5 md:grid-cols-2 [&>*]:mb-0", className)}>{children}</div>;
}

/**
 * An inline row of controls that ends in a button — search, add-a-shelf,
 * invite. A `div`, because these rows appear *inside* forms as often as they
 * are one; a nested `<form>` is invalid HTML and the browser silently drops it,
 * which shows up as a hydration mismatch rather than as anything readable.
 */
export function DashFieldRow({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mt-3 flex flex-wrap gap-2", className)} {...props}>
      {children}
    </div>
  );
}

/** The same row when it IS the form — a search box, an invite, an add. */
export function DashFieldForm({ children, className, ...props }: React.ComponentProps<"form">) {
  return (
    <form className={cn("mt-3 flex flex-wrap gap-2", className)} {...props}>
      {children}
    </form>
  );
}

/** The uppercase micro label above a field row. */
export function DashFieldRowLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-faint text-pico tracking-eyebrow -mb-1 mt-0.5 flex-[1_0_100%] font-mono font-bold uppercase">
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
    <div className="border-destructive rounded-tile border px-5 py-[18px]">
      <b className="text-destructive text-pico tracking-eyebrow block font-mono font-bold uppercase">
        {title}
      </b>
      <p className="text-muted-foreground text-copy mb-3.5 mt-2 max-w-[56ch] leading-[1.6]">
        {children}
      </p>
      {action}
    </div>
  );
}
