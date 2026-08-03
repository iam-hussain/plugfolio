import type { AccessibleProfile, ProfileContentCounts } from "@plugfolio/core";
import { MAX_PROFILES_PER_ACCOUNT } from "@plugfolio/core";
import { cn, DashPage, measure, PageHead, PageHeadActions, PageHeadTitle } from "@plugfolio/ui";
import type { ReactNode } from "react";
import { DashboardActions } from "./dashboard-actions";
import { DashboardTabs } from "./dashboard-tabs";
import { ProfileSwitcher } from "./profile-switcher";

/**
 * The creator back room's chrome (v2, `Plugfolio v2.dc.html` §dashboard),
 * under the same shared top bar as every other screen: the switcher on the
 * left (avatar · EDITING N OF M · name ▾), Share · QR and the accent
 * "View live page ↗" on the right, then the counted rail, then the tab body.
 *
 * Screens never invent their own header — which is only true if the header is
 * one thing, and this is it.
 */
export type DashboardShellProps = {
  profiles: readonly AccessibleProfile[];
  /** Per-profile section counts for the rail's pills, keyed by profile id. */
  counts?: Record<string, ProfileContentCounts>;
  children: ReactNode;
};

export function DashboardShell({ profiles, counts, children }: DashboardShellProps) {
  return (
    <div className="min-h-dvh">
      <div className={cn(measure(), "pt-5")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ProfileSwitcher profiles={profiles} maxProfiles={MAX_PROFILES_PER_ACCOUNT} />
          <DashboardActions profiles={profiles} />
        </div>
        <DashboardTabs profiles={profiles} counts={counts} />
      </div>
      <DashPage>{children}</DashPage>
    </div>
  );
}

/**
 * Page title block: the profile as an eyebrow, the section as the headline,
 * and at most a couple of actions. Every tab uses it, which is what makes
 * them feel like one product rather than seven screens.
 */
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
    <PageHead>
      <PageHeadTitle eyebrow={eyebrow}>{title}</PageHeadTitle>
      {action ? <PageHeadActions>{action}</PageHeadActions> : null}
    </PageHead>
  );
}
