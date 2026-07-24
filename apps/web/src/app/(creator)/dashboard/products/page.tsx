import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyProfiles, listMyCategories, listProfileProducts } from "@plugfolio/core";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle, Input } from "@plugfolio/ui";
import { DashboardPageHeader, DashboardShell, ProductRow } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Products tab (brief 08): the profile's product library — a list you scan.
// Fix a link, edit the coupon, remove one; changes propagate to every post.
export const metadata: Metadata = { title: "Products" };

type SearchParams = { profile?: string; q?: string };

export default async function DashboardProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const params = await searchParams;
  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, params.profile);
  if (!active) redirect("/dashboard");

  const [allProducts, categories] = await Promise.all([
    listProfileProducts({ creatorPages: repositories.creatorPages }, active.username),
    listMyCategories(
      { profiles: repositories.profiles, categories: repositories.categories },
      session.user.id,
      active.id,
    ),
  ]);
  // Search is a plain GET filter — the library is small in v1 (brief 08:
  // a list you scan, not a CRM).
  const query = (params.q ?? "").trim().toLowerCase();
  const products = query
    ? allProducts.filter((product) => product.title.toLowerCase().includes(query))
    : allProducts;

  return (
    <DashboardShell profiles={profiles} active={active}>
      <DashboardPageHeader title="Products" eyebrow={`@${active.username}`} />
      {allProducts.length > 0 ? (
        <form method="GET" className="pb-4">
          <input type="hidden" name="profile" value={active.id} />
          <label className="block">
            <span className="sr-only">Search products</span>
            <Input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search your products…"
            />
          </label>
        </form>
      ) : null}
      {products.length === 0 && query ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Nothing matches &quot;{params.q}&quot;.
        </p>
      ) : products.length === 0 ? (
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
              <ProductRow product={product} categories={categories} postCount={product.postCount} />
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
