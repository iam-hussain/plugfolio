import * as React from "react";
import { Badge } from "./badge";
import { cn } from "../lib/cn";

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
