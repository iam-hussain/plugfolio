import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyProfiles, listMyCategories } from "@plugfolio/core";
import { DashBody, PageHead, PageHeadTitle } from "@plugfolio/ui";
import { ChevronLeft } from "lucide-react";
import { ProductEditor } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// A product with no post yet (DESIGN product-edit.html, mode=new).
//
// Create and edit are the same screen — §5.9's variant matrix is the same set
// of decisions either way. What differs is the preview (nothing to fetch yet),
// the usage list and the taps, which a new product has none of; those are
// absent rather than greyed out.
export const metadata: Metadata = { title: "New product" };

type SearchParams = { profile?: string; post?: string };

export default async function NewProductPage({
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

  const categories = await listMyCategories(
    { profiles: repositories.profiles, categories: repositories.categories },
    session.user.id,
    active.id,
  );

  // Arrived from a post's connector: go back there, so the product a creator
  // just made is one press from the post they made it for.
  const backHref = (
    params.post
      ? `/dashboard/posts/${params.post}?profile=${active.id}`
      : `/dashboard/products?profile=${active.id}`
  ) as Route;

  return (
    <>
      <PageHead>
        <PageHeadTitle
          eyebrow={
            <Link href={backHref} className="inline-flex items-center gap-1 no-underline">
              <ChevronLeft className="size-3.5" aria-hidden />
              {params.post ? "Back to the post" : "All products"}
            </Link>
          }
        >
          New product
        </PageHeadTitle>
      </PageHead>

      <DashBody>
        <ProductEditor profileId={active.id} categories={categories} libraryHref={backHref} />
      </DashBody>
    </>
  );
}
