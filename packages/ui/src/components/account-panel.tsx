import * as React from "react";
import { cn } from "../lib/cn";

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
