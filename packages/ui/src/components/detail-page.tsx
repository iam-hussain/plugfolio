import * as React from "react";
import { Check, ChevronLeft } from "lucide-react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

/**
 * The vocabulary shared by the post view and the product view (DESIGN
 * post.html / product.html §"shared by both detail pages").
 *
 * Both open from a tile on a creator page and both are "one thing, in detail,
 * with a way back". They share the back link, the compact creator header, the
 * own-product marker and the off-platform line. These lived in post.html until
 * the product page needed the same components — a second copy is how the two
 * drift.
 */

export type BackLinkProps = React.ComponentProps<"a"> & { asChild?: boolean };

/** "All of @mayamoves" — the way back to the page this opened from. */
export function BackLink({ asChild, className, children, ...props }: BackLinkProps) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "text-muted-foreground hover:text-primary text-label -ml-1 inline-flex min-h-11 items-center gap-2 font-semibold no-underline transition-colors",
        className,
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          <ChevronLeft className="size-[15px]" aria-hidden />
          {children}
        </>
      )}
    </Comp>
  );
}

/** The chevron, for callers using `asChild` with their router's Link. */
export function BackLinkIcon() {
  return <ChevronLeft className="size-[15px]" aria-hidden />;
}

/**
 * The compact creator header (DESIGN §.pc) — identity, not a profile.
 *
 * It says *whose* post this is. The full `CreatorHeader` belongs on the creator
 * page alone: wearing it here makes a detail page read as a second landing page
 * and pushes the thing the visitor came for below the fold.
 */
export function CreatorByline({
  name,
  handle,
  avatar,
  asChild,
  children,
  action,
  className,
}: {
  /** The display name, or `@handle` when there isn't one. */
  name: React.ReactNode;
  /** Rendered under the name; omit when the name already IS the handle. */
  handle?: React.ReactNode;
  avatar: React.ReactNode;
  /**
   * Render the identity block as the app's router link. Pass a bare
   * `<Link href=… />` as `children`; the avatar and the two lines are injected
   * into it, so the link never re-states the layout.
   *
   * This used to be an `href` *slot* that replaced the identity block whole —
   * which meant every caller pasted the avatar, name and handle markup back
   * inside their own `<Link>`, and `name`/`handle`/`avatar` went dead. Two
   * pages, two copies, one component that no longer controlled its own layout.
   */
  asChild?: boolean;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const identity = (
    <>
      {avatar}
      <span className="flex min-w-0 flex-1 flex-col">
        <b className="font-display text-label font-extrabold tracking-[-0.02em]">{name}</b>
        {handle ? (
          <span className="text-muted-foreground text-micro font-semibold">{handle}</span>
        ) : null}
      </span>
    </>
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-3 pb-5 pt-1", className)}>
      {asChild ? (
        // Slottable marks where the caller's element goes; everything beside it
        // becomes that element's children — so the `<Link>` ends up wrapping the
        // identity block without ever having been handed its markup.
        <Slot className="flex min-w-0 flex-1 items-center gap-3 no-underline">
          {identity}
          <Slottable>{children}</Slottable>
        </Slot>
      ) : (
        identity
      )}
      {action ? <div className="ml-auto flex flex-none gap-2">{action}</div> : null}
    </div>
  );
}

/** The 44px round avatar the byline uses. */
export function BylineAvatar({ initial, src }: { initial: string; src?: string | null }) {
  return (
    <span className="bg-active text-primary font-display grid size-11 flex-none place-items-center overflow-hidden rounded-pill text-lg font-extrabold">
      {src ? (
        // A plain <img>: this package is framework-free and never imports next/image.
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}

/** "their own product" — quiet, and the action word changes with it. */
export function OwnBadge({ children = "their own product" }: { children?: React.ReactNode }) {
  return (
    <span className="bg-active text-primary text-micro mb-1.5 inline-flex items-center gap-[5px] rounded-pill px-[9px] py-[3px] font-bold">
      <Check className="size-3" strokeWidth={2.6} aria-hidden />
      {children}
    </span>
  );
}

/**
 * §2.3, said where the tap happens: Plugfolio never sits in the payment path,
 * so the page says where the money actually goes.
 */
export function OffPlatformNote({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-micro mt-2.5">{children}</p>;
}

/** A section heading with a count on the far right (DESIGN §.tagged-h). */
export function DetailSectionHeading({
  title,
  meta,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="border-border mt-[clamp(48px,6vw,68px)] flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5 border-b pb-3.5">
      <h2 className="font-display text-title font-extrabold tracking-[-0.02em]">{title}</h2>
      {meta ? (
        <span className="text-faint text-micro ml-auto font-semibold uppercase tracking-[0.06em]">
          {meta}
        </span>
      ) : null}
    </div>
  );
}
