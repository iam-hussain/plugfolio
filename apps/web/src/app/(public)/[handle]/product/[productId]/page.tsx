import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCreatorPage,
  getMemberHandle,
  getProductComments,
  COMMENTS_PAGE_SIZE,
  commentSort,
  getShopperProduct,
} from "@plugfolio/core";
import {
  BackLink,
  BackLinkIcon,
  BylineAvatar,
  Button,
  CreatorByline,
  OffPlatformNote,
  OwnBadge,
  ProductBuy,
  ProductDetail,
  ProductInStoreNote,
  ProductMedia,
  ProductPrice,
  ProductSource,
  ProductTitle,
  ProductWhere,
} from "@plugfolio/ui";
import { CouponBlock, ProductTapButton, ViewBeacon } from "@/features/creator-page";
import {
  CommentClaim,
  CommentForm,
  CommentList,
  CommentSortChips,
} from "@/features/shopper-account";
import { ReportButton } from "@/features/reporting";
import { isFeatureEnabled } from "@plugfolio/core";
import { JsonLd } from "@/components/json-ld";
import { formatPrice } from "@/lib/format-price";
import { breadcrumbList } from "@/lib/structured-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/** JSON-LD wants absolute URLs; page media may be a site-relative path. */
function absoluteUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}
import { retailerName } from "@/lib/retailer-name";
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
  const defaultAsProfileId = identities.some((identity) => identity.id === product.profileId)
    ? product.profileId
    : null;

  const price = formatPrice(product.priceCents, product.currency);
  const own = product.kind === "own";
  // No link means no button (ADR-0011): the code IS the action, and a Buy
  // here would promise a shop it can't reach.
  const inStoreOnly = product.affiliateUrl === null;

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
    <main data-accent={page.accent} className="mx-auto w-full max-w-[1180px] px-5 pb-14 lg:px-11">
      <JsonLd data={productLd} />
      <JsonLd data={crumbs} />
      <ViewBeacon surface="product" productId={product.id} />
      <BackLink asChild>
        <Link href={`/${page.username}`}>
          <BackLinkIcon />
          All of @{page.username}
        </Link>
      </BackLink>
      <CreatorByline
        avatar={<BylineAvatar initial={page.username.charAt(0).toUpperCase()} src={page.avatarUrl} />}
        name={page.displayName ?? `@${page.username}`}
        handle={page.displayName ? `@${page.username}` : undefined}
      />
      <ProductDetail>
        <ProductMedia>
          {product.imageUrl ? (
            /* ponytail: unoptimized until the social-import pipeline pins image domains */
            <Image
              src={product.imageUrl}
              alt={product.title}
              width={900}
              height={900}
              unoptimized
              priority
              className="block aspect-square w-full object-cover"
            />
          ) : null}
        </ProductMedia>

        <div>
          {own ? <OwnBadge>Their own product</OwnBadge> : null}
          <ProductTitle>{product.title}</ProductTitle>
          <ProductPrice>{price}</ProductPrice>
          <ProductWhere>
            {inStoreOnly ? (
              <>
                <b>In-store offer</b> · no link, use the code
              </>
            ) : (
              <>
                <b>{own ? "Their own product" : "Affiliate pick"}</b> · opens{" "}
                {retailerName(product.affiliateUrl!)}
              </>
            )}
          </ProductWhere>

          {/* Copy, then go — the coupon is always above the action (ADR-0011). */}
          {product.couponCode ? (
            <CouponBlock
              productId={product.id}
              postId={product.fromPost?.id}
              couponCode={product.couponCode}
              offerEndsAt={product.offerEndsAt}
              inStoreNote={product.inStoreNote}
              hasLink={!!product.affiliateUrl}
            />
          ) : null}

          {inStoreOnly ? (
            <ProductInStoreNote>
              {product.inStoreNote ??
                "Show the code at the counter. We can't track in-store redemption, so this one is on trust."}
            </ProductInStoreNote>
          ) : (
            <ProductBuy>
              <ProductTapButton
                productId={product.id}
                postId={product.fromPost?.id}
                affiliateUrl={product.affiliateUrl!}
                source="product"
                label={own ? "Shop their store" : "Buy"}
              />
            </ProductBuy>
          )}

          <OffPlatformNote>
            {inStoreOnly
              ? "Payment settles off-platform · show the code in store"
              : `Payment settles off-platform · opens ${own ? "their store" : "the retailer"}`}
          </OffPlatformNote>

          {product.fromPost ? (
            <ProductSource
              asChild
              title="Open the post"
              thumb={
                /* ponytail: unoptimized until the social-import pipeline pins image domains */
                <Image
                  src={product.fromPost.mediaUrl}
                  alt=""
                  width={116}
                  height={116}
                  unoptimized
                  className="size-full object-cover"
                />
              }
            >
              <Link href={`/${handle}/post/${product.fromPost.id}`} />
            </ProductSource>
          ) : null}
        </div>
      </ProductDetail>

      <section id="comments" aria-label="Comments" className="mt-[34px] scroll-mt-20">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="font-display text-lg font-bold">Comments</h2>
          <span className="text-muted-foreground font-mono text-[11px]">{comments.total}</span>
          <span className="ml-auto">
            <ReportButton targetType="product" targetId={product.id} targetLabel="this product" />
          </span>
        </div>
        {comments.total > 1 ? (
          <div className="mb-4">
            <CommentSortChips sort={activeSort} />
          </div>
        ) : null}
        <div className="pb-5">
          {!commentsEnabled ? (
            <p className="text-muted-foreground text-sm">Comments are switched off right now.</p>
          ) : session?.user ? (
            <CommentForm
              profileId={product.profileId}
              productId={product.id}
              ownHandle={ownHandle}
              identities={identities}
              defaultAsProfileId={defaultAsProfileId}
            />
          ) : (
            <CommentClaim />
          )}
        </div>
        <CommentList
          comments={comments.threads}
          signedIn={!!session?.user}
          replyContext={
            session?.user && commentsEnabled
              ? {
                  profileId: product.profileId,
                  productId: product.id,
                  ownHandle,
                  identities,
                  defaultAsProfileId,
                }
              : null
          }
        />
        {comments.total > commentPage * COMMENTS_PAGE_SIZE ? (
          <div className="pt-5">
            <Button variant="secondary" asChild>
              <Link
                href={{
                  pathname: `/${handle}/product/${product.id}`,
                  query: {
                    ...(activeSort === "recent" ? {} : { sort: activeSort }),
                    cpage: commentPage + 1,
                  },
                  hash: "comments",
                }}
              >
                Load more comments
              </Link>
            </Button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
