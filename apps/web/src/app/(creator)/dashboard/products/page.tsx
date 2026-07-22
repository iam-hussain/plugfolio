import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyProfiles, listMyCategories, listProfileProducts } from "@plugfolio/core";
import { ProductRow } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Products tab (lean journey): the things they've tagged. Fix a link, remove one.
export const metadata: Metadata = { title: "Products" };

type SearchParams = { profile?: string };

export default async function DashboardProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, (await searchParams).profile);
  if (!active) redirect("/dashboard");

  const [products, categories] = await Promise.all([
    listProfileProducts({ creatorPages: repositories.creatorPages }, active.username),
    listMyCategories(
      { profiles: repositories.profiles, categories: repositories.categories },
      session.user.id,
      active.id,
    ),
  ]);

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <nav className="py-4">
        <Link href="/dashboard" className="text-muted-foreground text-sm">
          ← Dashboard
        </Link>
      </nav>
      <header className="pb-6">
        <h1 className="font-display text-2xl font-semibold">
          Products · <span className="text-muted-foreground">@{active.username}</span>
        </h1>
      </header>
      {products.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nothing tagged yet — tag products from a post in{" "}
          <Link href={`/dashboard/posts?profile=${active.id}`} className="underline">
            Posts
          </Link>
          .
        </p>
      ) : (
        <div className="divide-border divide-y">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} categories={categories} />
          ))}
        </div>
      )}
    </main>
  );
}
