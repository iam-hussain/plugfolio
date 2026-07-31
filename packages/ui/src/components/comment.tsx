import * as React from "react";
import { cn } from "../lib/cn";

/**
 * The comment vocabulary (DESIGN creator.html §.cm-*) — one shape used on the
 * creator page, the product page and inside the comments sheet.
 *
 * Knows shapes, not sources (ADR-0018): the author's name, the badge, the
 * timestamp and the reaction controls all arrive as props or slots. In
 * particular the author's **email is never a prop** — a comment is signed by a
 * member handle or by a profile, and the address stays in the data layer.
 */

export function CommentSection({
  title = "Comments",
  count,
  report,
  children,
  className,
  ...props
}: React.ComponentProps<"section"> & {
  title?: string;
  count?: React.ReactNode;
  /** The quiet "Report page" link, far right of the heading. */
  report?: React.ReactNode;
}) {
  return (
    <section
      className={cn("border-border mt-[34px] border-t pb-11 pt-[34px]", className)}
      aria-label={title}
      {...props}
    >
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-title font-extrabold tracking-[-0.02em]">{title}</h2>
        {count !== undefined ? (
          <span className="text-muted-foreground text-micro font-bold tabular-nums">{count}</span>
        ) : null}
        {report ? <div className="ml-auto">{report}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** Recent · Oldest · Most helpful. */
export function CommentSort({ children }: { children: React.ReactNode }) {
  return (
    <div role="group" aria-label="Sort comments" className="mt-4 flex flex-wrap items-center gap-1.5">
      {children}
    </div>
  );
}

export function SortButton({
  selected,
  className,
  ...props
}: React.ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "border-border bg-card text-muted-foreground text-micro min-h-[38px] rounded-pill border px-3.5 py-2 font-bold",
        "transition-colors duration-200 ease-design hover:border-primary hover:text-primary",
        selected && "bg-foreground border-foreground text-background hover:text-background",
        className,
      )}
      {...props}
    />
  );
}

export function CommentList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul
      className={cn(
        // The page's list separates its entries; a threaded list doesn't,
        // because the reply rail already carries the structure.
        "mt-[18px] list-none p-0 [&>li+li]:border-t [&>li+li]:border-border",
        className,
      )}
    >
      {children}
    </ul>
  );
}

/** The 32px initial tile beside a comment. */
export function CommentAvatar({
  initial,
  src,
  className,
}: {
  initial: string;
  src?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-active text-primary text-micro grid size-8 flex-none place-items-center overflow-hidden rounded-pill font-extrabold",
        className,
      )}
    >
      {src ? (
        // A plain <img>: this package is framework-free and never imports next/image.
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}

export type CommentProps = {
  /** The display name, or `@handle` when there isn't one. */
  author: React.ReactNode;
  /** "Creator" when the comment speaks as a profile (ADR-0009). */
  badge?: React.ReactNode;
  when: string;
  body: React.ReactNode;
  avatar: React.ReactNode;
  /** Reactions, Reply, Report — the row under the body. */
  actions?: React.ReactNode;
  /** The one level of replies (ADR-0013). */
  replies?: React.ReactNode;
};

export function Comment({ author, badge, when, body, avatar, actions, replies }: CommentProps) {
  return (
    <>
      <div className="flex gap-3 py-3.5">
        {avatar}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <b className="text-label font-bold">{author}</b>
            {badge ? (
              <span className="bg-active text-primary text-micro rounded-pill px-2 py-0.5 font-bold uppercase tracking-[0.04em]">
                {badge}
              </span>
            ) : null}
            <span className="text-faint text-micro">{when}</span>
          </div>
          <p className="text-muted-foreground text-copy mt-[5px]">{body}</p>
          {actions ? <div className="mt-2 flex items-center gap-1">{actions}</div> : null}
        </div>
      </div>
      {replies}
    </>
  );
}

/** The indented reply rail — one level only (ADR-0013). */
export function CommentThread({ children }: { children: React.ReactNode }) {
  return (
    <ul className="border-border mb-1.5 ml-11 list-none border-l p-0 [&_>li]:pl-4">{children}</ul>
  );
}
