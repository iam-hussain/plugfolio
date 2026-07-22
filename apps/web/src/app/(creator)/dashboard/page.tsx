import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getEarnings, getMyProfiles } from "@plugfolio/core";
import { EarningsSummaryView } from "@/features/earnings";
import { NewProfileButton } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The creator's back room (lean journey: four tabs, not thirteen). Gated by
// session — this is an "act as yourself" surface, never a shop path (§2.2).
export const metadata: Metadata = { title: "Dashboard" };

type SearchParams = { profile?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const [profiles, connected] = await Promise.all([
    getMyProfiles({ profiles: repositories.profiles }, session.user.id),
    repositories.connections.hasAny(session.user.id),
  ]);
  const active = pickActiveProfile(profiles, (await searchParams).profile);
  const earnings = active
    ? await getEarnings({ earnings: repositories.earnings }, active.id)
    : null;

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <header className="py-8">
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">{session.user.email}</p>
        <nav aria-label="Dashboard sections" className="flex gap-4 pt-4 text-sm underline">
          <Link href={{ pathname: "/dashboard/posts", query: active ? { profile: active.id } : {} }}>
            Posts
          </Link>
          <Link
            href={{ pathname: "/dashboard/products", query: active ? { profile: active.id } : {} }}
          >
            Products
          </Link>
          <Link
            href={{ pathname: "/dashboard/categories", query: active ? { profile: active.id } : {} }}
          >
            Categories
          </Link>
          <Link href="/dashboard/collabs">Collabs</Link>
          {active?.role === "admin" ? (
            <Link href={{ pathname: "/dashboard/settings", query: { profile: active.id } }}>
              Settings
            </Link>
          ) : null}
        </nav>
      </header>

      <section aria-label="Profiles" className="pb-8">
        <div className="flex items-center justify-between pb-3">
          <h2 className="font-medium">Profiles</h2>
          <NewProfileButton />
        </div>
        {profiles.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {connected
              ? "No profiles yet — create one to get your shoppable page."
              : "Connect a Google or Meta account to create your first profile."}
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {profiles.map((profile) => (
              <li key={profile.id}>
                <Link
                  href={`/dashboard?profile=${profile.id}`}
                  className={`rounded-md border px-3 py-1 text-sm ${
                    profile.id === active?.id ? "border-primary font-medium" : "border-border"
                  }`}
                >
                  @{profile.username}
                  {profile.role === "manager" ? (
                    <span className="text-muted-foreground"> · manager</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!connected ? (
          <p className="text-muted-foreground pt-3 text-xs">
            Social connects (YouTube · Instagram) appear on the{" "}
            <Link href="/signin" className="underline">
              sign-in page
            </Link>{" "}
            once OAuth apps are configured.
          </p>
        ) : null}
      </section>

      {active && earnings ? (
        <section aria-label="Earnings">
          <h2 className="pb-4 font-medium">
            Earnings · <span className="text-muted-foreground">@{active.username}</span>
          </h2>
          <EarningsSummaryView summary={earnings} />
        </section>
      ) : null}
    </main>
  );
}
