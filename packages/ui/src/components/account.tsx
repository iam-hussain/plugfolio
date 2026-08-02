import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Badge } from "./badge";
import { cn } from "../lib/cn";

/**
 * The vocabulary of /account — a settings page every role shares.
 *
 * The page is **one destination at a time**, not one long scroll: a card that
 * states the account, a nav of destinations each carrying its own current
 * value, and the panel you chose. The nav is a scrolling row of chips above the
 * panel on a phone and a rail beside it from 900px — either way it stays on
 * screen, so switching destinations is one tap from anywhere and never a trip
 * back to an index.
 *
 * Why the nav shows values: a settings list whose rows are only nouns makes you
 * open all five to learn anything. "Connections · Google connected" answers the
 * question without the tap.
 *
 * Deliberately colourless. A settings page is somewhere you go to change one
 * thing and leave; a hue per section and a tinted header made five decorated
 * places out of one quiet list, and decoration is not orientation. Colour on
 * this page is the selected chip and nothing else.
 *
 * All colour, radius and type come from tokens; every state that varies is a
 * named variant, never a string built at render time.
 */

/**
 * The account, stated once: avatar, handle, what this account is, and the
 * address behind it. A plain raised card — white is the lift, the page is the
 * ground (§7).
 */
export function AccountHero({
  avatar,
  handle,
  name,
  email,
  role,
}: {
  avatar: React.ReactNode;
  handle: string;
  name?: string | null;
  email: string;
  /** "Shopper", "Creator" — what this account IS. */
  role: string;
}) {
  return (
    <div className="border-border bg-card rounded-card flex items-center gap-4 border px-4 py-4 sm:px-5">
      {avatar}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <b className="font-display text-title font-bold tracking-[-0.02em]">@{handle}</b>
          <Badge variant="soft-primary">{role}</Badge>
        </div>
        <span className="text-muted-foreground text-label mt-1 block truncate">
          {name ? `${name} · ` : null}
          {email}
        </span>
      </div>
    </div>
  );
}

const navItem = cva(
  "rounded-pill border text-left transition-colors whitespace-nowrap flex-none px-3.5 py-2 min-h-11 flex flex-col justify-center " +
    // From 900px the same control is a full-width rail row: left-aligned, two
    // lines, square-ish. One element, two shapes — a second component would be
    // a second thing to keep in step.
    "min-[900px]:rounded-image min-[900px]:w-full min-[900px]:whitespace-normal min-[900px]:px-3 min-[900px]:py-2.5",
  {
    variants: {
      state: {
        idle: "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/25 min-[900px]:border-transparent min-[900px]:bg-transparent min-[900px]:hover:bg-active min-[900px]:hover:border-transparent",
        // The selected chip is the one piece of colour on the page.
        active:
          "border-transparent bg-foreground text-background min-[900px]:bg-active min-[900px]:text-foreground",
      },
    },
    defaultVariants: { state: "idle" },
  },
);

/**
 * One destination: its name, and the value it currently holds. The value is a
 * second line on the rail and is dropped from the phone chip, where a row of
 * two-line chips would be a wall rather than a nav.
 */
export type AccountNavItemProps = React.ComponentProps<"button"> & {
  label: string;
  /** The live fact — "3 of 5 profiles", "Google connected". */
  value?: React.ReactNode;
  active?: boolean;
};

export function AccountNavItem({ label, value, active, className, ...props }: AccountNavItemProps) {
  return (
    <button
      type="button"
      className={cn(navItem({ state: active ? "active" : "idle" }), className)}
      {...props}
    >
      <span className="text-label min-[900px]:text-copy block font-bold leading-tight">
        {label}
      </span>
      {value ? (
        <span className="text-muted-foreground text-micro mt-0.5 hidden truncate font-medium min-[900px]:block">
          {value}
        </span>
      ) : null}
    </button>
  );
}

/** The head of the open panel — the title the nav chip carries, said in full. */
export function AccountPanelHead({ title, lead }: { title: string; lead?: React.ReactNode }) {
  return (
    <header className="mb-4">
      <h2 className="font-display text-title font-bold leading-[1.2] tracking-[-0.02em]">
        {title}
      </h2>
      {lead ? (
        <p className="text-muted-foreground text-copy mt-1.5 max-w-[58ch] leading-[1.55]">{lead}</p>
      ) : null}
    </header>
  );
}

/** A block inside a panel — a sub-heading and its payload. */
export function AccountSection({
  id,
  title,
  lead,
  children,
}: {
  id?: string;
  title?: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="[&+&]:mt-8">
      {title ? (
        <h3 className="font-display text-title font-bold leading-[1.2] tracking-[-0.02em]">
          {title}
        </h3>
      ) : null}
      {lead ? (
        <p className="text-muted-foreground text-copy mt-1 max-w-[58ch] leading-[1.55]">{lead}</p>
      ) : null}
      <div className={cn(title || lead ? "mt-4" : null)}>{children}</div>
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
        <dt className="text-label min-w-[148px] font-bold">{label}</dt>
        <dd className="text-muted-foreground text-copy m-0 min-w-0 [overflow-wrap:anywhere]">
          {value}
          {hint ? <span className="text-faint text-label mt-0.5 block">{hint}</span> : null}
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
        <b className="text-label block font-bold">{title}</b>
        <span className="text-faint text-label block">{detail}</span>
      </span>
      <Badge variant={badge.variant}>{badge.label}</Badge>
      {action ? <div className="sm:ml-auto">{action}</div> : null}
    </div>
  );
}
