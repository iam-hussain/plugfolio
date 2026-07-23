import { MAX_PROFILES_PER_ACCOUNT, type AccessibleProfile } from "@plugfolio/core";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { DashboardTabs } from "./dashboard-tabs";
import { ProfileSwitcher } from "./profile-switcher";

/**
 * The creator back room's chrome (briefs 07–10): brand top bar with the
 * profile switcher, section tabs beneath, content in a centered column.
 * Every /dashboard page renders inside this — screens never invent their own
 * header.
 */
export type DashboardShellProps = {
  profiles: readonly AccessibleProfile[];
  active?: AccessibleProfile;
  children: ReactNode;
};

export function DashboardShell({ profiles, active, children }: DashboardShellProps) {
  return (
    <div className="min-h-dvh">
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-3 px-4">
          <Link href="/dashboard" aria-label="Dashboard home" className="flex items-center">
            <Logo layout="horizontal" tone="auto" />
          </Link>
          <ProfileSwitcher
            profiles={profiles}
            active={active}
            maxProfiles={MAX_PROFILES_PER_ACCOUNT}
          />
        </div>
        <DashboardTabs profileId={active?.id} isAdmin={active?.role === "admin"} />
      </header>
      <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16">{children}</main>
    </div>
  );
}

/** Page title block: mono eyebrow (the profile) over a display headline. */
export function DashboardPageHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-3 pb-6">
      <div>
        {eyebrow ? (
          <p className="font-mono tracking-eyebrow text-muted-foreground pb-1 text-[11px] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display tracking-display text-2xl font-semibold">{title}</h1>
      </div>
      {action}
    </header>
  );
}
