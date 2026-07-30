import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getCreatorPage,
  getMyProfiles,
  listMyCategories,
  listProfileProducts,
} from "@plugfolio/core";
import { DashBody, Hint } from "@plugfolio/ui";
import { CategoryManager, DashboardPageHeader } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Manage the profile's shelves (ADR-0010, DESIGN dashboard.html §5.22). Admin
// AND Managers curate — it's content work, same tier as tagging.
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

  const [categories, page, products] = await Promise.all([
    listMyCategories(
      { profiles: repositories.profiles, categories: repositories.categories },
      session.user.id,
      active.id,
    ),
    getCreatorPage({ creatorPages: repositories.creatorPages }, active.username),
    listProfileProducts({ creatorPages: repositories.creatorPages }, active.username),
  ]);

  // "6 posts · 11 products" — counted from the page read rather than a second
  // query, because the page read already carries both.
  const counts = new Map(
    categories.map((category) => [
      category.id,
      {
        posts: (page?.posts ?? []).filter((post) => post.categoryId === category.id).length,
        products: products.filter((product) => product.categoryId === category.id).length,
      },
    ]),
  );

  return (
    <>
      <DashboardPageHeader title="Categories" eyebrow={`@${active.username}`} />

      <DashBody>
        <Hint>
          Your shelves. They group this profile&rsquo;s posts and products, and they are yours alone
          — there is no shared list of categories across Plugfolio. A post or product sits on one
          shelf, or none.
        </Hint>
        <CategoryManager profileId={active.id} categories={categories} counts={counts} />
      </DashBody>
    </>
  );
}
