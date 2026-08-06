import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

export type AccountRole = "shopper" | "creator" | "business";

/**
 * A role block — held or offered, always the same shape so the page doesn't
 * reshuffle when someone gains a role. The dot takes the role hue from the
 * `data-role` tokens, so no colour is written here.
 */
export function RoleBlock({
  role,
  title,
  note,
  action,
  children,
}: {
  role: AccountRole;
  title: string;
  /** The one-line state: "Always on", "2 of 5 profiles used", "Not set up". */
  note: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      data-role={role}
      className="border-border bg-card rounded-tile border px-5 py-5 [&+&]:mt-3"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden className="bg-role-deep rounded-pill size-2.5 flex-none" />
        <b className="font-display text-title font-bold tracking-[-0.02em]">{title}</b>
        <span className="text-faint text-micro font-sans font-semibold uppercase tracking-[0.06em]">
          {note}
        </span>
        {/* `ml-auto` only once the row actually fits on one line — pushed right
            after wrapping, the button lands alone in a gap it opened itself. */}
        {action ? <div className="sm:ml-auto">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

/** A role block's body copy — the paragraph under the heading row. */
export function RoleCopy({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-copy mt-2 max-w-[60ch] leading-[1.55]">{children}</p>
  );
}

/**
 * A stated prerequisite — the thing that must happen first, said here rather
 * than discovered as an error two screens later.
 */
export function Prerequisite({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="bg-active text-primary rounded-image text-copy mt-3.5 flex gap-3 px-4 py-3 leading-[1.5]">
      <span aria-hidden className="mt-0.5 flex-none">
        {icon}
      </span>
      <span>{children}</span>
    </p>
  );
}

/** A profile inside the creator block — a door into that profile's dashboard. */
export function ProfileRow({
  username,
  meta,
  badge,
  asChild,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  username: string;
  meta: string;
  badge: string;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "border-border rounded-image hover:border-primary flex items-center gap-3 border px-3.5 py-2.5 no-underline transition-colors",
        className,
      )}
      {...props}
    >
      {/* Slot clones ONE child; Slottable marks it, and the rest become
          that element's children — which is what lets the app pass its router
          Link while the design system supplies the contents. */}
      <Slottable>{children}</Slottable>
      <span className="bg-active text-primary rounded-pill text-label grid size-8 flex-none place-items-center font-bold">
        {username.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0">
        <b className="text-label block truncate font-bold">@{username}</b>
        <span className="text-faint text-micro block truncate">{meta}</span>
      </span>
      <span className="text-muted-foreground text-micro ml-auto whitespace-nowrap font-bold">
        {badge}
      </span>
    </Comp>
  );
}

/** The dashed "one more" row — the cap is a fact, so it says the number. */
export function ProfileNewRow({
  label,
  asChild,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & { label: string; asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "border-border text-muted-foreground rounded-image hover:border-primary hover:text-primary text-label flex items-center gap-3 border border-dashed px-3.5 py-3 font-semibold no-underline transition-colors",
        className,
      )}
      {...props}
    >
      <Slottable>{children}</Slottable>
      {label}
    </Comp>
  );
}
