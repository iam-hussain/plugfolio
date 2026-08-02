import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Badge } from "./badge";
import { Tile } from "./tile";
import { cn } from "../lib/cn";

/**
 * The vocabulary of /account — a settings page every role shares.
 *
 * The page is **one destination at a time**, not one long scroll: a hero that
 * says who you are, an index of destinations each carrying its own current
 * value, and the panel you chose. On a phone the index and the panel take
 * turns; from 900px the index becomes a rail beside the panel.
 *
 * Why the index shows values: a settings list whose rows are only nouns makes
 * you open all five to learn anything. "Connections › Google connected" answers
 * the question from the index, and the tap becomes a decision instead of a
 * search.
 *
 * All colour, radius and type come from tokens; every state that varies is a
 * named variant, never a string built at render time.
 */

/** The account's own hue sequence — assigned by POSITION, never by meaning. */
export const ACCOUNT_TONES = ["lavender", "sky", "butter", "mint", "coral"] as const;
export type AccountTone = (typeof ACCOUNT_TONES)[number];

const toneDot = cva("rounded-pill size-2.5 flex-none", {
  variants: {
    tone: {
      lavender: "bg-tile-lavender",
      sky: "bg-tile-sky",
      butter: "bg-tile-butter",
      mint: "bg-tile-mint",
      coral: "bg-tile-coral",
      blush: "bg-tile-blush",
    },
  },
  defaultVariants: { tone: "lavender" },
});

/**
 * The hero — the page's one saturated moment (§7 tile-carries-colour), and the
 * only place the account is stated whole. The role rides on a white pill with a
 * dot, which is the product tag's move borrowed for a person: the same shape
 * that names a price on a photograph names what this account is.
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
  /** "Shopper", "Creator" — what this account IS, on the tag pill. */
  role: string;
}) {
  return (
    <Tile
      tone="lavender"
      className="rounded-bay flex flex-wrap items-center gap-x-5 gap-y-4 px-5 py-6 sm:px-7"
    >
      {avatar}
      <div className="min-w-0 flex-1 basis-[min(100%,220px)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <b className="font-display text-name font-extrabold leading-none tracking-[-0.035em]">
            @{handle}
          </b>
          <span className="bg-card shadow-tag rounded-pill text-micro inline-flex items-center gap-1.5 px-2.5 py-1 font-bold">
            <span aria-hidden className="bg-primary rounded-pill size-1.5" />
            {role}
          </span>
        </div>
        <span className="text-copy mt-1.5 block truncate opacity-75">
          {name ? `${name} · ` : null}
          {email}
        </span>
      </div>
    </Tile>
  );
}

const indexRow = cva(
  "group/row rounded-tile flex w-full min-h-14 items-center gap-3 border border-transparent px-4 py-3 text-left transition-colors min-[900px]:min-h-12 min-[900px]:gap-2.5 min-[900px]:px-3 min-[900px]:py-2.5",
  {
    variants: {
      state: {
        idle: "hover:bg-active hover:border-border/60",
        // Only from 900px does "selected" mean anything — on a phone the panel
        // has replaced the index by the time it would show.
        active: "min-[900px]:bg-active min-[900px]:text-brand-violet-deep hover:bg-active",
      },
    },
    defaultVariants: { state: "idle" },
  },
);

/**
 * One destination in the index: hue dot, name, the value it currently holds,
 * and the way in. The value drops under the name on a phone so a long email
 * never squeezes the label to one word per line.
 */
export type AccountIndexRowProps = React.ComponentProps<"button"> & {
  tone: AccountTone;
  label: string;
  /** The live fact — "3 of 5 profiles", "Google connected". */
  value?: React.ReactNode;
  active?: boolean;
};

export function AccountIndexRow({
  tone,
  label,
  value,
  active,
  className,
  ...props
}: AccountIndexRowProps) {
  return (
    <button
      type="button"
      className={cn(indexRow({ state: active ? "active" : "idle" }), className)}
      {...props}
    >
      <span aria-hidden className={toneDot({ tone })} />
      <span className="min-w-0 flex-1">
        <span className="text-body min-[900px]:text-copy block font-bold leading-tight">
          {label}
        </span>
        {value ? (
          <span className="text-muted-foreground text-label mt-0.5 block truncate font-medium min-[900px]:hidden">
            {value}
          </span>
        ) : null}
      </span>
      <ChevronRight
        aria-hidden
        className="text-faint group-hover/row:text-primary size-4 flex-none transition-colors min-[900px]:hidden"
      />
    </button>
  );
}

/** The head of an open panel: the same dot the index row carried, so the two
 *  read as one place seen twice. */
export function AccountPanelHead({
  tone,
  title,
  lead,
  back,
}: {
  tone: AccountTone;
  title: string;
  lead?: React.ReactNode;
  /** The phone's way back to the index; absent from 900px, where both show. */
  back?: React.ReactNode;
}) {
  return (
    <header className="mb-5">
      {back ? <div className="mb-2 min-[900px]:hidden">{back}</div> : null}
      <div className="flex items-center gap-2.5">
        <span aria-hidden className={toneDot({ tone })} />
        <h2 className="font-display text-name font-extrabold leading-[1.1] tracking-[-0.035em]">
          {title}
        </h2>
      </div>
      {lead ? (
        <p className="text-muted-foreground text-copy mt-2 max-w-[58ch] leading-[1.55]">{lead}</p>
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
        {action ? <div className="ml-auto">{action}</div> : null}
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
      {action ? <div className="ml-auto">{action}</div> : null}
    </div>
  );
}
