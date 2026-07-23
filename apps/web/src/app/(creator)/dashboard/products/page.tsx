import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyProfiles, listMyCategories, listProfileProducts } from "@plugfolio/core";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@plugfolio/ui";
import { DashboardPageHeader, DashboardShell, ProductRow } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Products tab (brief 08): the profile's product library — a list you scan.
// Fix a link, edit the coupon, remove one; changes propagate to every post.
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
    <DashboardShell profiles={profiles} active={active}>
      <DashboardPageHeader title="Products" eyebrow={`@${active.username}`} />
      {products.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No products yet</EmptyTitle>
            <EmptyDescription>
              Tag a product on a post to see it here — open a post from the Posts tab and paste a
              product URL.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductRow product={product} categories={categories} />
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
