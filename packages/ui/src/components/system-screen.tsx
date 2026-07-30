import * as React from "react";
import { cn } from "../lib/cn";

/**
 * SystemScreen — the shared centre-of-the-page layout the system screens wear
 * (DESIGN 404.html / error.html / system.html §.sys). One quiet mark, a Sora
 * headline, a line of reassurance, and a row of actions — the same skeleton
 * for "not found" and "went wrong", so they read as one product rather than
 * two companies.
 *
 * `children` is anything that rides below the actions (a reference chip, a
 * "still works" list) — kept in the centred column. A full-width section (the
 * 404's creator suggestions) belongs after this component, not inside it.
 */
export function SystemScreen({
  mark,
  title,
  lede,
  actions,
  children,
  className,
}: {
  mark: React.ReactNode;
  title: React.ReactNode;
  lede: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "grid min-h-[68vh] place-items-center px-5 pb-[clamp(32px,5vw,56px)] pt-[clamp(44px,8vw,104px)] text-center",
        className,
      )}
    >
      <div className="max-w-[48ch]">
        {mark ? <div className="mb-[26px] flex justify-center">{mark}</div> : null}
        <h1 className="font-display text-name font-extrabold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="text-copy text-muted-foreground mx-auto mt-3.5 max-w-[44ch] leading-[1.6]">{lede}</p>
        {actions ? (
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">{actions}</div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
