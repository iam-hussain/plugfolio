"use client";

import * as React from "react";
import { Info, TriangleAlert } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * The auth form vocabulary (DESIGN auth.html §.af / §.notice / §.status).
 *
 * Every account screen is one column of at most 380px: label, field, rule,
 * one full-width action, and one consequence line. The narrowness is the
 * point — a sign-in that spans the measure reads as a form to fill in rather
 * than a door to walk through.
 */
export function AuthForm({ children, className, ...props }: React.ComponentProps<"form">) {
  return (
    <form className={cn("mx-auto w-full max-w-[380px]", className)} {...props}>
      {children}
    </form>
  );
}

export type AuthFieldProps = {
  label: string;
  /** The 54px box's contents — an input, plus any trailing control. */
  children: React.ReactNode;
  /** "At least 8 characters." — the rule, stated before it's broken. */
  rule?: React.ReactNode;
  htmlFor?: string;
};

/**
 * One labelled field. The rule sits *under* the box, always visible: telling
 * someone their password is too short only after they submit is the same
 * information delivered at the worst moment.
 */
export function AuthField({ label, children, rule, htmlFor }: AuthFieldProps) {
  return (
    <label className="mt-[18px] block" htmlFor={htmlFor}>
      <span className="text-muted-foreground text-micro mb-[7px] block font-bold uppercase tracking-[0.06em]">
        {label}
      </span>
      <span className="border-border bg-card rounded-image focus-within:border-primary focus-within:ring-primary/20 flex min-h-[54px] items-center gap-2 border py-0 pl-4 pr-2 focus-within:ring-[3px]">
        {children}
      </span>
      {rule ? (
        <span className="text-muted-foreground text-micro mt-[7px] block">{rule}</span>
      ) : null}
    </label>
  );
}

/** The bare input inside an `AuthField` box. */
export const AuthInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  function AuthInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "text-copy text-foreground placeholder:text-faint min-h-11 min-w-0 flex-1 border-0 bg-transparent outline-none",
          className,
        )}
        {...props}
      />
    );
  },
);

/** The Show/Hide control that rides inside a password field. */
export function AuthReveal({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "text-muted-foreground hover:text-primary text-micro min-h-11 border-0 bg-transparent px-2.5 py-3 font-bold uppercase tracking-[0.06em]",
        className,
      )}
      {...props}
    />
  );
}

/** The line under the action — what happens next, before it happens. */
export function AuthConsequence({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-micro mt-3 text-center">{children}</p>;
}

/**
 * A row of secondary ways out. `items-center` is load-bearing: the links carry
 * a 44px tap target and the plain text beside them doesn't, so under the
 * default stretch the text renders its line at the top while the link centres
 * its own — and the two sit ~20px apart on a row that should share a baseline.
 */
export function AuthAlternatives({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-micro text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
      {children}
    </div>
  );
}

const notice = cva(
  "rounded-image mt-5 flex items-start gap-[11px] border px-4 py-3.5 text-copy leading-[1.5]",
  {
    variants: {
      tone: {
        bad: "bg-brand-coral/[0.16] border-brand-coral/50 text-foreground",
        info: "bg-active border-transparent text-foreground",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

/** A message the screen carries — an error, or a thing worth knowing. */
export function AuthNotice({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: "bad" | "info";
  title?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const Icon = tone === "bad" ? TriangleAlert : Info;
  return (
    <div className={notice({ tone })} role={tone === "bad" ? "alert" : undefined}>
      <Icon className="mt-0.5 size-[18px] flex-none" aria-hidden />
      <div className="min-w-0">
        {title ? <b className="block">{title}</b> : null}
        {children}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}

/**
 * The confirmation screens: one status object, one action. Check your email,
 * verified, link expired — each is a single stamp, a sentence, and the one
 * thing to do next.
 */
export function AuthStatus({
  icon,
  title,
  children,
  actions,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <span className="bg-active text-primary rounded-pill mx-auto mb-5 grid size-16 place-items-center [&_svg]:size-7">
        {icon}
      </span>
      <h1 className="font-display text-name font-extrabold tracking-[-0.03em]">{title}</h1>
      {children ? (
        <p className="text-muted-foreground text-copy mx-auto mt-3 max-w-[38ch]">{children}</p>
      ) : null}
      {actions ? <div className="mt-2.5 flex flex-col items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}
