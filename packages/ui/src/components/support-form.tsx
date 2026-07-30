import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * The support form vocabulary (DESIGN support.html).
 *
 * The emotional job of a help page is to make the wait legible, so every part
 * of it says one more true thing than it has to.
 */

/** A labelled block: a Sora heading, one line of why, then the control. */
export function SupportField({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="mt-[clamp(26px,3.5vw,36px)] block">
      <label
        htmlFor={htmlFor}
        className="font-display text-title block font-bold tracking-[-0.02em]"
      >
        {label}
      </label>
      {hint ? (
        <span className="text-muted-foreground text-copy mb-3 mt-1 block">{hint}</span>
      ) : null}
      {children}
    </div>
  );
}

/**
 * The category picker — radio cards, **not** a `<select>`.
 *
 * Nine options behind a dropdown means someone who is already stuck has to
 * open a menu and read nine lines to find out whether their problem is even
 * listed. Laid out flat, the whole set is visible at once and the answer is
 * one tap.
 */
export function SupportCategories({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-2 min-[620px]:grid-cols-2">{children}</div>;
}

export function SupportCategory({
  className,
  children,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <label className="relative block">
      {/* `peer` + sr-only rather than a hidden input plus a <style> tag: the
          whole card stays the target, and the checked state is a class. */}
      <input type="radio" className="peer sr-only" {...props} />
      <span
        className={cn(
          "border-border bg-card text-copy rounded-image flex min-h-[56px] cursor-pointer items-center gap-2.5 border px-4 py-3.5 font-semibold leading-[1.35]",
          "transition-colors duration-150 ease-design hover:border-primary",
          // The dot is drawn by the label, so there is no second hit target.
          "before:border-border before:size-4 before:flex-none before:rounded-pill before:border-2 before:transition-[border-width,border-color] before:duration-150 before:content-['']",
          "peer-checked:border-primary peer-checked:bg-active peer-checked:text-primary peer-checked:before:border-primary peer-checked:before:border-[5px]",
          "peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
          className,
        )}
      >
        {children}
      </span>
    </label>
  );
}

/**
 * The one fact that makes a ticket answerable on the first reply instead of
 * the third — so it sits in the flow, not in a tooltip.
 */
export function SupportHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="bg-active text-primary rounded-image text-copy mt-3.5 flex gap-2.5 px-4 py-3.5 leading-[1.5]">
      <Info aria-hidden className="mt-0.5 size-[17px] flex-none" />
      <span>{children}</span>
    </p>
  );
}

/** Who the ticket will be signed by — stated before it's sent, not after. */
export function SupportWho({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-active text-primary text-micro mt-[18px] inline-flex items-center gap-[9px] rounded-pill px-4 py-2.5 font-bold uppercase tracking-[0.04em] [&_svg]:size-[15px] [&_svg]:flex-none">
      {children}
    </span>
  );
}

/**
 * What happens next. Three steps, stated plainly — including the one nobody
 * else states: there is no phone line, and pretending otherwise is how a help
 * page loses trust before the ticket is even read.
 */
export function SupportNext({
  title = "What happens next",
  children,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border mt-[clamp(34px,5vw,52px)] border-t pt-6">
      <h2 className="text-muted-foreground text-micro font-bold uppercase tracking-[0.06em]">
        {title}
      </h2>
      <ol className="mt-4 grid list-none gap-3.5 p-0">{children}</ol>
    </section>
  );
}

export function SupportStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span className="bg-foreground text-background text-micro grid size-7 flex-none place-items-center rounded-pill font-bold tabular-nums">
        {n}
      </span>
      <span className="text-muted-foreground text-copy min-w-0 leading-[1.55]">{children}</span>
    </li>
  );
}
