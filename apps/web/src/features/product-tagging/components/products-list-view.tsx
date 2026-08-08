import type { Route } from "next";
import Link from "next/link";
import type { CreatorProductRow } from "@plugfolio/core";
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
import { formatPrice } from "@/lib/format-price";
import { hostname } from "@/lib/retailer-name";
import { DashboardPageHeader } from "./dashboard-shell";

/**
 * The creator's Products tab (DESIGN dashboard.html §5.21) — the profile's
 * library. The library LISTS; the product page edits.
 *
 * The route above it loads and nothing else (§5: `app/` is thin).
 */
export type ProductsListViewProps = {
  profileId: string;
  username: string;
  /** Every product on the profile — drives the search box's presence. */
  allProducts: readonly CreatorProductRow[];
  /** The products under the active search. */
  products: readonly CreatorProductRow[];
  /** Category id → shelf title. */
  categoryById: Map<string, string>;
  /** The raw search term, as typed — for the input and the empty-state copy. */
  q: string | undefined;
  /** The normalized search term — truthy only when a real search is active. */
  query: string;
};

export function ProductsListView({
  profileId,
  username,
  allProducts,
  products,
  categoryById,
  q,
  query,
}: ProductsListViewProps) {
  return (
    <>
      <DashboardPageHeader title="Products" eyebrow={`@${username}`} />

      <DashBody>
        {allProducts.length > 0 ? (
          <DashFieldForm method="GET" role="search" className="mb-[18px] mt-0">
            <input type="hidden" name="profile" value={profileId} />
            <label className="min-w-0 flex-[1_1_220px]">
              <span className="sr-only">Search products</span>
              <Input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search your products…"
              />
            </label>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </DashFieldForm>
        ) : null}

        {products.length === 0 && query ? (
          <EmptyState title="Nothing matches">No product is called &ldquo;{q}&rdquo;.</EmptyState>
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
                        href={`/dashboard/products/${product.id}?profile=${profileId}` as Route}
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
