import { redirect } from "next/navigation";
import { getMyProfiles } from "@plugfolio/core";
import type { ReactNode } from "react";
import { DashboardShell } from "@/features/product-tagging";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

/**
 * The back room's shell, rendered once (§5.17).
 *
 * "Screens never invent their own header" only holds if there is one
 * header. Every /dashboard page used to render <DashboardShell> itself,
 * which meant the brand bar, profile switcher and tab row were rebuilt on
 * every navigation — and loading.tsx, which replaces everything below the
 * nearest layout, had no choice but to throw the chrome away and redraw it.
 * Hoisted here, the chrome mounts once and only the body streams.
 *
 * The layout deliberately does NOT resolve the active profile. A Next
 * layout never receives searchParams, and ?profile= is where the active one
 * lives — so the switcher reads it from the URL itself. Passing it down
 * would mean pushing the shell back into the pages, which is the thing
 * this file exists to stop.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);

  return <DashboardShell profiles={profiles}>{children}</DashboardShell>;
}
