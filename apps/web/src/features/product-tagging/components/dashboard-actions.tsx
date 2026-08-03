"use client";

import type { AccessibleProfile } from "@plugfolio/core";
import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
// The leaf, not the creator-page barrel — the barrel value-exports the tap
// api and, through core, node:crypto, which kills the client bundle.
import { PageShare } from "@/features/creator-page/components/page-share";

/**
 * The dashboard header's right side (v2 §dashboard): Share · QR for the
 * profile being edited, and the accent way out to its live page. Client, like
 * the switcher, because the active profile lives in ?profile= and a layout
 * never sees searchParams — both read the URL by the same rule, so they can't
 * disagree about which profile the row is pointing at.
 */
export function DashboardActions({ profiles }: { profiles: readonly AccessibleProfile[] }) {
  const params = useSearchParams();
  const requested = params.get("profile") ?? undefined;
  const active = profiles.find((profile) => profile.id === requested) ?? profiles[0];
  if (!active) return null;

  return (
    <div className="flex flex-none flex-wrap items-center gap-2">
      <PageShare
        handle={active.username}
        displayName={active.displayName}
        avatarUrl={active.avatarUrl}
        meta={`plugfolio.com/${active.username}`}
        trigger="pill"
        className="border-border-strong text-label rounded-pill flex h-10 items-center whitespace-nowrap border px-4 font-semibold transition-transform hover:-translate-y-px"
      />
      <Link
        href={`/${active.username}` as Route}
        className="bg-primary text-primary-foreground text-label rounded-pill flex h-10 items-center gap-1 whitespace-nowrap px-4 font-semibold transition-transform hover:-translate-y-px"
      >
        View live page <span aria-hidden>↗</span>
      </Link>
    </div>
  );
}
