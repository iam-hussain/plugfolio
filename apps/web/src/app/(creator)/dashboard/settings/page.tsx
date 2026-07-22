import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyProfiles, listManagers } from "@plugfolio/core";
import { ManagerControls } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { profileManagerDeps, repositories } from "@/server/container";

// Profile settings (brief 10, lite): Managers only for now — username picking
// and connection management land with the social APIs. Admin-only surface
// (ADR-0004): Managers see every tab EXCEPT this one.
export const metadata: Metadata = { title: "Settings" };

type SearchParams = { profile?: string };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, (await searchParams).profile);
  if (!active || active.role !== "admin") redirect("/dashboard");

  const managers = await listManagers(profileManagerDeps, session.user.id, active.id);

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <nav className="py-4">
        <Link href="/dashboard" className="text-muted-foreground text-sm">
          ← Dashboard
        </Link>
      </nav>
      <header className="pb-6">
        <h1 className="font-display text-2xl font-semibold">
          Settings · <span className="text-muted-foreground">@{active.username}</span>
        </h1>
      </header>
      <section aria-label="Managers">
        <h2 className="pb-1 font-medium">Managers</h2>
        <p className="text-muted-foreground pb-4 text-sm">
          Up to 3 people who can post and tag on this profile. Settings and connections stay
          yours.
        </p>
        <ManagerControls profileId={active.id} managers={managers} />
      </section>
    </main>
  );
}
