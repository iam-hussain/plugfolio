import { MAX_PROFILES_PER_ACCOUNT, type AccessibleProfile } from "@plugfolio/core";
import {
  DashBody,
  DashHeader,
  DashPage,
  DashTop,
  PageHead,
  PageHeadActions,
  PageHeadTitle,
} from "@plugfolio/ui";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { DashboardTabs } from "./dashboard-tabs";
import { ProfileSwitcher } from "./profile-switcher";

/**
 * The creator back room's chrome (DESIGN dashboard.html §5.17): mark, profile
 * switcher, section tabs, and a centred 1200px column beneath.
 *
 * Screens never invent their own header — which is only true if the header is
 * one thing. Post and product editing are their own routes now, so this stays
 * the single place any of it is drawn.
 */
export type DashboardShellProps = {
  profiles: readonly AccessibleProfile[];
  active?: AccessibleProfile;
  children: ReactNode;
};

export function DashboardShell({ profiles, active, children }: DashboardShellProps) {
  return (
    <div className="min-h-dvh">
      <DashHeader>
        <DashTop>
          <Link href="/dashboard" aria-label="Plugfolio dashboard" className="flex items-center">
            <Logo layout="horizontal" tone="auto" />
          </Link>
          <ProfileSwitcher
            profiles={profiles}
            active={active}
            maxProfiles={MAX_PROFILES_PER_ACCOUNT}
          />
        </DashTop>
        <DashboardTabs profileId={active?.id} />
      </DashHeader>
      <DashPage>{children}</DashPage>
    </div>
  );
}

/**
 * Page title block: the profile as an eyebrow, the section as the headline,
 * and at most a couple of actions. Every tab uses it, which is what makes them
 * feel like one product rather than six screens.
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

/** The body below the page header — kept separate so the header sits flush. */
export { DashBody as DashboardBody };
