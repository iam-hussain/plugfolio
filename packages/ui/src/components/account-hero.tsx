import * as React from "react";
import { Badge } from "./badge";

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
