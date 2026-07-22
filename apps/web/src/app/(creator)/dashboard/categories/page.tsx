import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyProfiles, listMyCategories } from "@plugfolio/core";
import { CategoryManager } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Manage the profile's shelves (ADR-0010). Admin AND Managers curate — it's
// content work, same tier as tagging.
export const metadata: Metadata = { title: "Categories" };

type SearchParams = { profile?: string };

export default async function DashboardCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, (await searchParams).profile);
  if (!active) redirect("/dashboard");

  const categories = await listMyCategories(
    { profiles: repositories.profiles, categories: repositories.categories },
    session.user.id,
    active.id,
  );

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <nav className="py-4">
        <Link href="/dashboard" className="text-muted-foreground text-sm">
          ← Dashboard
        </Link>
      </nav>
      <header className="pb-6">
        <h1 className="font-display text-2xl font-semibold">
          Categories · <span className="text-muted-foreground">@{active.username}</span>
        </h1>
      </header>
      <CategoryManager profileId={active.id} categories={categories} />
    </main>
  );
}
