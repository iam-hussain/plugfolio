import { searchProducts } from "@plugfolio/core";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import type { Metadata } from "next";
import { ConfirmButton } from "@/components/confirm-button";
import { SearchHeader } from "@/components/search-header";
import { clock, repositories } from "@/server/container";
import { clearCouponAction, deleteProductAction } from "./actions";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

function formatPrice(priceCents: number | null, currency: string): string {
  if (priceCents === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(priceCents / 100);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await searchProducts({ content: repositories.content }, q);
  const now = clock.now();

  return (
    <div className="flex flex-col gap-6">
      <SearchHeader title="Products" query={q} placeholder="Search title, profile…" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Kind</TableHead>
            <TableHead>Coupon</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="max-w-md">
                <p className="truncate text-sm font-medium">{product.title}</p>
                <p className="text-muted-foreground text-xs tabular-nums">
                  {formatPrice(product.priceCents, product.currency)}
                  {product.affiliateUrl ? (
                    <>
                      {" · "}
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        Outbound link
                      </a>
                    </>
                  ) : null}
                </p>
              </TableCell>
              <TableCell className="font-mono text-xs">/{product.username}</TableCell>
              <TableCell>
                <Badge variant="outline">{product.kind === "own" ? "Own" : "Affiliate"}</Badge>
              </TableCell>
              <TableCell>
                {product.couponCode ? (
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="font-mono">
                      {product.couponCode}
                    </Badge>
                    {product.offerEndsAt && product.offerEndsAt < now ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {product.couponCode ? (
                    <form action={clearCouponAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <ConfirmButton
                        size="sm"
                        variant="ghost"
                        message="Clear this product's coupon (code, expiry, in-store note)?"
                      >
                        Clear coupon
                      </ConfirmButton>
                    </form>
                  ) : null}
                  <form action={deleteProductAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <ConfirmButton
                      size="sm"
                      variant="destructive"
                      message="Remove this product and its recorded taps? This can't be undone."
                    >
                      Remove
                    </ConfirmButton>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                No products match.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
