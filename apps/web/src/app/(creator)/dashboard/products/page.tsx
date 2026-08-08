import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCreatorPage, getMyProfiles, listProfileProducts } from "@plugfolio/core";
import { ProductsListView } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Products tab (DESIGN dashboard.html §5.21): the profile's library.
//
// The library LISTS; the product page edits. Inline link, coupon and shelf
// editors lived here before the product page existed, and leaving them meant
// two screens could each claim to be where a product is changed. A list you
// scan is also what §5.21 asks for — a CRM is what it says this must not
// become.
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

  const [allProducts, page] = await Promise.all([
    listProfileProducts({ creatorPages: repositories.creatorPages }, active.username),
    getCreatorPage({ creatorPages: repositories.creatorPages }, active.username),
  ]);
  const categoryById = new Map((page?.categories ?? []).map((c) => [c.id, c.title]));

  // Search is a plain GET filter — the library is small in v1.
  const query = (params.q ?? "").trim().toLowerCase();
  const products = query
    ? allProducts.filter((product) => product.title.toLowerCase().includes(query))
    : allProducts;

  return (
    <ProductsListView
      profileId={active.id}
      username={active.username}
      allProducts={allProducts}
      products={products}
      categoryById={categoryById}
      q={params.q}
      query={query}
    />
  );
}
