import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCreatorPage,
  getMemberHandle,
  getProductComments,
  commentSort,
  getShopperProduct,
  getTraffic,
} from "@plugfolio/core";
import { ProductPageView } from "@/features/creator-page";
import { formatPrice } from "@/lib/format-price";
import { isFeatureEnabled } from "@plugfolio/core";
import { breadcrumbList } from "@/lib/structured-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/** JSON-LD wants absolute URLs; page media may be a site-relative path. */
function absoluteUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Product page (brief 03 + 13, design-out product detail): creator header on
// top, then the two-column detail — image beside title/price, the coupon
// panel, one outbound action, the off-platform line and "from this post" —
// plus its own comment thread (ADR-0013). The buy path stays account-free
// (ADR-0002, §2.2); a session only enriches.
type Params = { handle: string; productId: string };
type SearchParams = { sort?: string; cpage?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle, productId } = await params;
  const product = await getShopperProduct(
    { creatorPages: repositories.creatorPages },
    handle,
    productId,
  );
  if (!product) return { title: `@${handle}` };

  const price = formatPrice(product.priceCents, product.currency);
  const title = `${product.title} · @${handle}`;
  const description = `${product.title}${price ? ` — ${price}` : ""}, tagged by @${handle} on ${SITE_NAME}. Tap through and buy it straight at the retailer — no account needed.`;
  const path = `/${handle}/product/${productId}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { handle, productId } = await params;
  const { sort, cpage } = await searchParams;
  const activeSort = commentSort.catch("recent").parse(sort);
  const commentPage = Math.max(1, Number(cpage) || 1);
  const deps = { creatorPages: repositories.creatorPages };
  const [page, product] = await Promise.all([
    getCreatorPage(deps, handle),
    getShopperProduct(deps, handle, productId),
  ]);
  if (!page || !product) notFound();

  const session = await auth();
  const commentsEnabled = await isFeatureEnabled(
    { settings: repositories.settings },
    "comments",
    true,
  );
  const [comments, ownHandle, memberships] = await Promise.all([
    getProductComments({ comments: repositories.comments }, product.id, {
      sort: activeSort,
      page: commentPage,
      viewerId: session?.user?.id ?? null,
    }),
    session?.user
      ? getMemberHandle({ users: repositories.users }, session.user.id)
      : Promise.resolve(""),
    session?.user
      ? repositories.profiles.listAccessibleByUser(session.user.id)
      : Promise.resolve([]),
  ]);

  const identities = memberships.map(({ id, username }) => ({ id, username }));
  // The owner sees this product's numbers where they're looking at the product
  // (DESIGN product.html §.band-v). Visitors never do. Copies are counted;
  // whether a code was redeemed at a counter is not, and the band says so
  // rather than letting the number imply a sale (§2.3).
  const isOwner = memberships.some((membership) => membership.id === page.id);
  const traffic = isOwner
    ? ((await getTraffic({ traffic: repositories.traffic }, page.id)).byProduct.find(
        (row) => row.productId === product.id,
      ) ?? null)
    : null;

  // Structured data (SEO/AEO): a Product with an Offer when the tagged price is
  // known, plus the breadcrumb trail. Only what the page already shows — the
  // price is the display price, the image is the one on screen.
  const productPath = `/${page.username}/product/${product.id}`;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(absoluteUrl(product.imageUrl) ? { image: absoluteUrl(product.imageUrl) } : {}),
    description: `${product.title}, tagged by @${page.username} on ${SITE_NAME}.`,
    brand: { "@type": "Brand", name: `@${page.username}` },
    ...(product.priceCents !== null
      ? {
          offers: {
            "@type": "Offer",
            price: (product.priceCents / 100).toFixed(2),
            priceCurrency: product.currency.toUpperCase(),
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}${productPath}`,
          },
        }
      : {}),
  };
  const crumbs = breadcrumbList([
    { name: SITE_NAME, path: "/" },
    { name: `@${page.username}`, path: `/${page.username}` },
    { name: product.title, path: productPath },
  ]);

  return (
    <ProductPageView
      page={page}
      product={product}
      traffic={traffic}
      isOwner={isOwner}
      comments={{
        page: comments,
        sort: activeSort,
        pageNumber: commentPage,
        enabled: commentsEnabled,
      }}
      viewer={{ signedIn: !!session?.user, ownHandle, identities }}
      structuredData={[productLd, crumbs]}
    />
  );
}
