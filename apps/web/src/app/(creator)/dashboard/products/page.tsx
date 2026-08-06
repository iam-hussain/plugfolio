import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCreatorPage, getMyProfiles, listProfileProducts } from "@plugfolio/core";
import {
  Button,
  DashBody,
  DashFieldForm,
  EmptyState,
  IconAction,
  Input,
  MetaDot,
  MetaWarn,
  Pill,
  ProductRow,
  ProductRows,
  ProductThumb,
} from "@plugfolio/ui";
import { Pencil } from "lucide-react";
import { DashboardPageHeader } from "@/features/product-tagging";
import { formatPrice } from "@/lib/format-price";
import { hostname } from "@/lib/retailer-name";
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
    <>
      <DashboardPageHeader title="Products" eyebrow={`@${active.username}`} />

      <DashBody>
        {allProducts.length > 0 ? (
          <DashFieldForm method="GET" role="search" className="mb-[18px] mt-0">
            <input type="hidden" name="profile" value={active.id} />
            <label className="min-w-0 flex-[1_1_220px]">
              <span className="sr-only">Search products</span>
              <Input
                type="search"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search your products…"
              />
            </label>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </DashFieldForm>
        ) : null}

        {products.length === 0 && query ? (
          <EmptyState title="Nothing matches">
            No product is called &ldquo;{params.q}&rdquo;.
          </EmptyState>
        ) : products.length === 0 ? (
          <EmptyState title="No products yet">
            Add one while editing a post — paste a product URL and it lands in this list.
          </EmptyState>
        ) : (
          <ProductRows>
            {products.map((product) => {
              const price = formatPrice(product.priceCents, product.currency);
              const shelf = product.categoryId ? categoryById.get(product.categoryId) : null;
              const destination = product.affiliateUrl ? hostname(product.affiliateUrl) : null;
              return (
                <ProductRow
                  key={product.id}
                  image={<ProductThumb src={product.imageUrl} />}
                  title={product.title}
                  price={price}
                  badges={
                    <>
                      {product.kind === "own" ? <Pill tone="own">Their own</Pill> : null}
                      {product.couponCode ? (
                        <Pill tone="code">
                          {product.affiliateUrl ? "Code" : "In-store"} {product.couponCode}
                        </Pill>
                      ) : null}
                      {price ? null : <Pill tone="none">No price</Pill>}
                    </>
                  }
                  meta={
                    <>
                      <span>
                        {product.kind === "own" ? "Own store" : "Affiliate"}
                        {destination ? ` · opens ${destination}` : " · no link"}
                      </span>
                      <MetaDot />
                      <span>{shelf ?? "No shelf"}</span>
                      <MetaDot />
                      {/* A product that outlived the post it was tagged on is
                          still a product; it just has nothing pointing at it. */}
                      {product.postCount === 0 ? (
                        <MetaWarn>not on any post</MetaWarn>
                      ) : (
                        <span>
                          on {product.postCount} {product.postCount === 1 ? "post" : "posts"}
                        </span>
                      )}
                    </>
                  }
                  action={
                    <IconAction label={`Edit ${product.title}`} asChild>
                      <Link
                        href={`/dashboard/products/${product.id}?profile=${active.id}` as Route}
                      >
                        <Pencil aria-hidden />
                      </Link>
                    </IconAction>
                  }
                />
              );
            })}
          </ProductRows>
        )}
      </DashBody>
    </>
  );
}

