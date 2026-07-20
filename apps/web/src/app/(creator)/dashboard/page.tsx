import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getEarnings, getMyProfiles } from "@plugfolio/core";
import { EarningsSummaryView } from "@/features/earnings";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The creator's back room (lean journey: four tabs, not thirteen). Gated by
// session — this is an "act as yourself" surface, never a shop path (§2.2).
// v0: profile list + the Earnings read; Posts/Products/Collabs tabs land with
// tagging and social import.
export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  // ponytail: first profile only; the profile switcher lands with profile creation.
  const active = profiles[0];
  const earnings = active
    ? await getEarnings({ earnings: repositories.earnings }, active.id)
    : null;

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <header className="py-8">
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">{session.user.email}</p>
      </header>
      {!active || !earnings ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No profiles yet. Connect your socials to create one — coming soon.
        </p>
      ) : (
        <section aria-label="Earnings">
          <h2 className="pb-4 font-medium">
            Earnings · <span className="text-muted-foreground">@{active.username}</span>
          </h2>
          <EarningsSummaryView summary={earnings} />
        </section>
      )}
    </main>
  );
}
