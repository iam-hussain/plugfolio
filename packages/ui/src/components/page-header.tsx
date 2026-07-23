import * as React from "react";
import { cn } from "../lib/cn";

/**
 * PageHeader — the Admin-design list-screen header: Sora title (24/700,
 * -0.02em) with an optional subtitle line, and a right-aligned actions row
 * (filters, search, export). Wraps on narrow widths.
 */
export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Right side: filter selects, SearchField, buttons. */
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-[18px] flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">{title}</h1>
        {subtitle ? (
          <p className="text-muted-foreground mt-1 text-[12.5px]">{subtitle}</p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
