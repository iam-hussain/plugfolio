import { redirect } from "next/navigation";
import { getMyProfiles } from "@plugfolio/core";
import type { ReactNode } from "react";
import { AppTopBar } from "@/components/chrome";
import { DashboardShell } from "@/features/product-tagging";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

/**
 * The back room's shell, rendered once (§5.17) — and, per the v2 design, under
 * the SAME top bar as every other screen: the dashboard is a place in the
 * product, not a second product. The switcher and the page actions live in
 * the body's own header row.
 *
 * The rail's count pills need per-profile counts, and a layout never sees
 * ?profile= — so counts are fetched for every accessible profile (≤5, four
 * cheap counts each) and the client rail picks the active one's row by the
 * same URL rule the switcher uses.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const counts = Object.fromEntries(
    await Promise.all(
      profiles.map(
        async (profile) =>
          [profile.id, await repositories.profiles.contentCounts(profile.id)] as const,
      ),
    ),
  );

  return (
    <>
      <AppTopBar />
      <DashboardShell profiles={profiles} counts={counts}>
        {children}
      </DashboardShell>
    </>
  );
}
