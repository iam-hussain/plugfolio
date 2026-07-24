import { searchProducts, type ProductCouponFilter } from "@plugfolio/core";
import {
  Badge,
  Button,
  ConfirmDialog,
  PageHeader,
  Pager,
  SearchField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import { Download } from "lucide-react";
import type { Metadata } from "next";
import { BulkAllCheckbox, BulkBar, BulkCheckbox, BulkSelect } from "@/components/bulk-select";
import { FilterSelect } from "@/components/filter-select";
import { Panel } from "@/components/panel";
import { pagedHref, pageQuery, statusFilter, type ListParams } from "@/lib/list-params";
import { clock, repositories } from "@/server/container";
import { bulkDeleteProductsAction, clearCouponAction, deleteProductAction } from "./actions";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

const COUPON_FILTERS = ["has-coupon", "expired-coupon"] as const;

function formatPrice(priceCents: number | null, currency: string): string {
  if (priceCents === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(priceCents / 100);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ListParams>;
}) {
  const params = await searchParams;
  const coupon = statusFilter<ProductCouponFilter>(params.status, COUPON_FILTERS);
  const page = pageQuery(params);
  const now = clock.now();
  const { rows, total } = await searchProducts(
    { content: repositories.content, now: clock.now },
    params.q,
    coupon,
    page,
  );

  return (
    <BulkSelect>
      <PageHeader title="Products">
        <form className="flex flex-wrap items-center gap-2">
          <FilterSelect
            name="status"
            defaultValue={params.status}
            label="Filter by coupon"
            options={[["", "All products"], ["has-coupon", "Has coupon"], ["expired-coupon", "Expired coupon"]]}
          />
          <SearchField
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search title / profile"
            className="w-[230px]"
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Search
          </Button>
          <Button asChild size="xs" variant="ghost-muted">
            <a href={`/products/export${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`}>
              <Download aria-hidden className="size-[15px]" /> Export CSV
            </a>
          </Button>
        </form>
      </PageHeader>

      <BulkBar
        verb="Remove"
        title={(n) => `Remove ${n} products?`}
        body="The action applies to every selected row. This cannot be undone. Recorded in the audit log."
        confirmLabel={(n) => `Remove ${n}`}
        action={bulkDeleteProductsAction}
        successToast={(n) => `Removed ${n} products`}
      />

      <Panel className="overflow-hidden">
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[34px]">
                <BulkAllCheckbox ids={rows.map((r) => r.id)} />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Coupon</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="w-[34px]">
                  <BulkCheckbox id={product.id} label={`Select ${product.title}`} />
                </TableCell>
                <TableCell>
                  <span className="block font-medium">{product.title}</span>
                  <span className="font-mono text-muted-foreground mt-0.5 block text-xs">
                    {formatPrice(product.priceCents, product.currency)}
                    {product.affiliateUrl ? (
                      <>
                        {" · "}
                        <a
                          href={product.affiliateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary"
                        >
                          Outbound link ↗
                        </a>
                      </>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground text-xs">
                  /{product.username}
                </TableCell>
                <TableCell>
                  <Badge shape="square" variant="outline-muted">
                    {product.kind === "own" ? "Own" : "Affiliate"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {product.couponCode ? (
                    <span className="flex items-center gap-1">
                      <Badge shape="square" variant="soft-primary" className="font-mono">
                        {product.couponCode}
                      </Badge>
                      {product.offerEndsAt && product.offerEndsAt < now ? (
                        <Badge shape="square" variant="soft-destructive">
                          Expired
                        </Badge>
                      ) : null}
                    </span>
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="flex justify-end gap-1.5">
                    {product.couponCode ? (
                      <ConfirmDialog
                        trigger={<Button size="xs" variant="ghost-muted">Clear coupon</Button>}
                        title="Clear this coupon?"
                        body="The code and offer are removed from the product. The product stays live. Recorded in the audit log."
                        confirmLabel="Clear coupon"
                        action={clearCouponAction}
                        hiddenFields={{ productId: product.id }}
                        successToast="Coupon cleared"
                      />
                    ) : null}
                    <ConfirmDialog
                      trigger={<Button size="xs" variant="destructive-outline">Remove</Button>}
                      title="Remove this product?"
                      body="Removes the product and its recorded taps — the same cascade as a creator removing their own. This cannot be undone. Recorded in the audit log."
                      confirmLabel="Remove product"
                      action={deleteProductAction}
                      hiddenFields={{ productId: product.id }}
                      successToast="Product removed"
                    />
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-faint py-8 text-center">
                  No products match.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Panel>
      <Pager page={page.page} pageSize={page.pageSize} total={total} hrefFor={pagedHref("/products", params)} />
    </BulkSelect>
  );
}
