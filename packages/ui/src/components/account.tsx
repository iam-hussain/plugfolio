import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Badge } from "./badge";
import { cn } from "../lib/cn";

/**
 * The vocabulary of /account (DESIGN account.html) — a settings page every
 * role shares. Four shapes, reused for every section: a section rail, a
 * label/value/action row, a role block, a connection row.
 *
 * All colour, radius and type come from tokens; every state that varies is a
 * named variant, never a string built at render time.
 */

/** Section links — a snap rail on phones, a sticky column from 900px. */
export function AccountNav({
  sections,
}: {
  sections: readonly { id: string; label: string }[];
}) {
  return (
    <nav
      aria-label="Account sections"
      className="-mx-5 flex snap-x [scrollbar-width:none] snap-proximity gap-2 overflow-x-auto px-5 pb-1 min-[900px]:sticky min-[900px]:top-[78px] min-[900px]:mx-0 min-[900px]:flex-col min-[900px]:gap-0.5 min-[900px]:overflow-visible min-[900px]:px-0"
    >
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="border-border bg-card text-muted-foreground rounded-pill hover:border-primary hover:text-primary inline-flex min-h-11 flex-none snap-start items-center whitespace-nowrap border px-4 py-2.5 text-label font-semibold no-underline transition-colors min-[900px]:rounded-image min-[900px]:hover:bg-active min-[900px]:w-full min-[900px]:border-0 min-[900px]:bg-transparent min-[900px]:px-3.5 min-[900px]:py-2.5 min-[900px]:hover:border-0"
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}

/** A settings section: heading, one line of why, then its payload. */
export function AccountSection({
  id,
  title,
  lead,
  children,
}: {
  id?: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pt-[clamp(30px,4vw,46px)]">
      <h2 className="font-display text-title font-bold leading-[1.2] tracking-[-0.02em]">
        {title}
      </h2>
      {lead ? (
        <p className="text-muted-foreground mt-1 max-w-[58ch] text-copy leading-[1.55]">
          {lead}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** The bordered list a section's rows live in — one hairline between rows. */
export function SettingRows({ children }: { children: React.ReactNode }) {
  return (
    <dl className="border-border bg-card rounded-tile divide-border divide-y overflow-hidden border">
      {children}
    </dl>
  );
}

/**
 * One setting: what it is, what it's set to, one way to change it. `children`
 * takes an inline editor (the handle form) that needs the full width.
 */
export function SettingRow({
  label,
  value,
  hint,
  action,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  hint?: React.ReactNode;
  /** The single row action — a Button, usually `variant="secondary"`. */
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <dt className="min-w-[148px] text-label font-bold">{label}</dt>
        <dd className="text-muted-foreground m-0 min-w-0 text-copy [overflow-wrap:anywhere]">
          {value}
          {hint ? <span className="text-faint mt-0.5 block text-label">{hint}</span> : null}
        </dd>
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

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
        <span aria-hidden className="bg-role-deep size-2.5 flex-none rounded-pill" />
        <b className="font-display text-title font-bold tracking-[-0.02em]">{title}</b>
        <span className="text-faint font-sans text-micro font-semibold uppercase tracking-[0.06em]">
          {note}
        </span>
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

/** A role block's body copy — the paragraph under the heading row. */
export function RoleCopy({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground mt-2 max-w-[60ch] text-copy leading-[1.55]">
      {children}
    </p>
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
    <p className="bg-active text-primary rounded-image mt-3.5 flex gap-3 px-4 py-3 text-copy leading-[1.5]">
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
      <span className="bg-active text-primary grid size-8 flex-none place-items-center rounded-pill text-label font-bold">
        {username.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0">
        <b className="block truncate text-label font-bold">@{username}</b>
        <span className="text-faint block truncate text-micro">{meta}</span>
      </span>
      <span className="text-muted-foreground ml-auto whitespace-nowrap text-micro font-bold">
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
        "border-border text-muted-foreground rounded-image hover:border-primary hover:text-primary flex items-center gap-3 border border-dashed px-3.5 py-3 text-label font-semibold no-underline transition-colors",
        className,
      )}
      {...props}
    >
      <Slottable>{children}</Slottable>
      {label}
    </Comp>
  );
}

/** Connection states — Badge carries the variants (lime stays offer-only). */
const CONNECTION_BADGE = {
  connected: { variant: "soft-primary", label: "Connected" },
  disconnected: { variant: "outline-muted", label: "Not connected" },
  unavailable: { variant: "outline-muted", label: "Not available" },
} as const satisfies Record<
  string,
  { variant: React.ComponentProps<typeof Badge>["variant"]; label: string }
>;

export type ConnectionStatus = keyof typeof CONNECTION_BADGE;

/** One connectable social: glyph, what it is, its state, one action. */
export function ConnectionRow({
  glyph,
  title,
  detail,
  status,
  action,
  className,
}: {
  glyph: React.ReactNode;
  title: string;
  detail: string;
  status: ConnectionStatus;
  action?: React.ReactNode;
  className?: string;
}) {
  const badge = CONNECTION_BADGE[status];
  return (
    <div className={cn("flex flex-wrap items-center gap-3.5 px-5 py-4", className)}>
      <span
        aria-hidden
        className="bg-active text-primary rounded-image grid size-10 flex-none place-items-center"
      >
        {glyph}
      </span>
      <span className="min-w-0">
        <b className="block text-label font-bold">{title}</b>
        <span className="text-faint block text-label">{detail}</span>
      </span>
      <Badge variant={badge.variant}>{badge.label}</Badge>
      {action ? <div className="ml-auto">{action}</div> : null}
    </div>
  );
}
