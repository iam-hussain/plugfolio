import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getShopperProduct } from "@plugfolio/core";
import { ProductTapButton } from "@/features/creator-page";
import { formatPrice } from "@/lib/format-price";
import { repositories } from "@/server/container";

// Product page (brief 03): photo, price, the post it came from, one Buy
// button. The buy path stays account-free (ADR-0002, §2.2).
type Params = { handle: string; productId: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle, productId } = await params;
  const product = await getShopperProduct(
    { creatorPages: repositories.creatorPages },
    handle,
    productId,
  );
  return { title: product ? `${product.title} · @${handle}` : `@${handle}` };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { handle, productId } = await params;
  const product = await getShopperProduct(
    { creatorPages: repositories.creatorPages },
    handle,
    productId,
  );
  if (!product) notFound();

  const price = formatPrice(product.priceCents, product.currency);

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <nav className="py-4">
        <Link href={`/${handle}`} className="text-muted-foreground text-sm">
          ← @{handle}
        </Link>
      </nav>
      {product.imageUrl ? (
        <div className="bg-muted relative aspect-square overflow-hidden rounded-md">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            unoptimized
            className="object-cover"
            priority
          />
        </div>
      ) : null}
      <h1 className="font-display pt-4 text-xl font-semibold">{product.title}</h1>
      {price ? <p className="text-muted-foreground pt-1">{price}</p> : null}
      <div className="pt-4">
        <ProductTapButton
          productId={product.id}
          postId={product.fromPost?.id}
          affiliateUrl={product.affiliateUrl}
          source="product"
          label="Buy"
        />
      </div>
      {product.fromPost ? (
        <aside className="pt-6">
          <p className="text-muted-foreground pb-2 text-sm">From this post</p>
          <Link
            href={`/${handle}/post/${product.fromPost.id}`}
            className="bg-muted relative block h-24 w-24 overflow-hidden rounded-sm"
          >
            <Image
              src={product.fromPost.mediaUrl}
              alt="Post"
              fill
              unoptimized
              className="object-cover"
            />
          </Link>
        </aside>
      ) : null}
    </main>
  );
}
