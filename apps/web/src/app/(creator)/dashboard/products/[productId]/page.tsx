import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getCreatorPage,
  getMyProfiles,
  getTraffic,
  listMyCategories,
  listProfileProducts,
} from "@plugfolio/core";
import { ProductEditorView } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The product page (DESIGN product-edit.html). Its own page, because a product
// is not owned by the post it was tagged on: it can sit on several, or on none
// once its post is deleted, and every one of them shows the same title, price,
// link and coupon. The posts using it are listed as a CONSEQUENCE rather than
// as a container.
export const metadata: Metadata = { title: "Edit product" };

type Params = { productId: string };
type SearchParams = { profile?: string };

export default async function ProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const { productId } = await params;
  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, (await searchParams).profile);
  if (!active) redirect("/dashboard");

  const [products, categories, traffic, page] = await Promise.all([
    listProfileProducts({ creatorPages: repositories.creatorPages }, active.username),
    listMyCategories(
      { profiles: repositories.profiles, categories: repositories.categories },
      session.user.id,
      active.id,
    ),
    getTraffic({ traffic: repositories.traffic }, active.id),
    getCreatorPage({ creatorPages: repositories.creatorPages }, active.username),
  ]);
  const product = products.find((row) => row.id === productId);
  if (!product) notFound();

  const measured = traffic.byProduct.find((row) => row.productId === product.id);
  // Used by, not owned by. Taken from the page read, which already carries
  // every post with its tagged products.
  const usedOn = (page?.posts ?? []).filter((post) =>
    post.products.some((tagged) => tagged.id === product.id),
  );
  const tapsByPost = new Map(traffic.byPost.map((row) => [row.postId, row.taps]));

  return (
    <ProductEditorView
      profileId={active.id}
      username={active.username}
      product={product}
      categories={categories}
      measured={measured}
      usedOn={usedOn}
      tapsByPost={tapsByPost}
    />
  );
}
