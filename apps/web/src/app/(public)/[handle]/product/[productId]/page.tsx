import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCreatorPage,
  getMemberHandle,
  getProductComments,
  getShopperProduct,
} from "@plugfolio/core";
import { CouponBlock, CreatorHeader, ProductTapButton } from "@/features/creator-page";
import { CommentClaim, CommentForm, CommentList } from "@/features/shopper-account";
import { formatPrice } from "@/lib/format-price";
import { retailerName } from "@/lib/retailer-name";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Product page (brief 03 + 13, design-out product detail): creator header on
// top, then the two-column detail — image beside title/price, the coupon
// panel, one outbound action, the off-platform line and "from this post" —
// plus its own comment thread (ADR-0013). The buy path stays account-free
// (ADR-0002, §2.2); a session only enriches.
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
  const deps = { creatorPages: repositories.creatorPages };
  const [page, product] = await Promise.all([
    getCreatorPage(deps, handle),
    getShopperProduct(deps, handle, productId),
  ]);
  if (!page || !product) notFound();

  const session = await auth();
  const [comments, ownHandle, memberships] = await Promise.all([
    getProductComments({ comments: repositories.comments }, product.id),
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
  const kindLine = product.affiliateUrl
    ? `${product.kind === "own" ? "their own product" : "affiliate pick"} · opens ${retailerName(product.affiliateUrl)}`
    : "in-store offer";

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-14 lg:px-11">
      <CreatorHeader handle={page.username} followerCount={page.followerCount} />
      <nav className="mt-4 pb-3.5">
        <Link
          href={`/${handle}`}
          className="text-muted-foreground hover:text-foreground font-mono text-xs"
        >
          ← Back to @{handle}
        </Link>
      </nav>
      <div className="flex flex-col gap-[18px] lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-5">
        <div className="border-border bg-muted relative aspect-square overflow-hidden rounded-2xl border">
          {product.imageUrl ? (
            /* ponytail: unoptimized until the social-import pipeline pins image domains */
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              unoptimized
              className="object-cover"
              priority
            />
          ) : null}
        </div>
        <div>
          {product.kind === "own" ? (
            <p className="text-muted-foreground border-border rounded-pill mb-2.5 inline-block border px-2.5 py-[3px] font-mono text-[9px] font-bold tracking-[0.06em]">
              THEIR OWN PRODUCT
            </p>
          ) : null}
          <h1 className="font-display text-2xl font-extrabold leading-[1.1] tracking-[-0.02em]">
            {product.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
            {price ? (
              <span className="font-display text-primary text-[22px] font-extrabold">{price}</span>
            ) : null}
            <span className="text-muted-foreground font-mono text-[11px]">{kindLine}</span>
          </div>

          {product.couponCode ? (
            <div className="mt-4">
              <CouponBlock
                productId={product.id}
                postId={product.fromPost?.id}
                couponCode={product.couponCode}
                offerEndsAt={product.offerEndsAt}
                inStoreNote={product.inStoreNote}
                hasLink={!!product.affiliateUrl}
              />
            </div>
          ) : null}

          {product.affiliateUrl ? (
            <div className="mt-4">
              <ProductTapButton
                productId={product.id}
                postId={product.fromPost?.id}
                affiliateUrl={product.affiliateUrl}
                source="product"
                label={product.kind === "own" ? "Shop their store →" : "Buy →"}
                className="font-display h-auto w-full max-w-[320px] py-3.5 text-[15px] font-bold"
              />
            </div>
          ) : null}
          <p className="text-muted-foreground/70 mt-2.5 font-mono text-[10.5px]">
            Payment settles off-platform · opens the retailer
          </p>

          {product.fromPost ? (
            <div className="border-border mt-5 border-t pt-3.5">
              <p className="text-muted-foreground mb-2 font-mono text-[10px] uppercase tracking-[0.08em]">
                From this post
              </p>
              <Link
                href={`/${handle}/post/${product.fromPost.id}`}
                className="inline-flex items-center gap-3"
              >
                <span className="bg-muted relative block size-12 overflow-hidden rounded-[10px]">
                  {/* ponytail: unoptimized until the social-import pipeline pins image domains */}
                  <Image
                    src={product.fromPost.mediaUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </span>
                <span className="text-primary text-sm font-semibold">Open the post →</span>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <section aria-label="Comments" className="mt-[34px]">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="font-display text-lg font-bold">Comments</h2>
          <span className="text-muted-foreground font-mono text-[11px]">{comments.length}</span>
        </div>
        <CommentList
          comments={comments}
          replyContext={
            session?.user
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
        <div className="pt-4">
          {session?.user ? (
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
      </section>
    </main>
  );
}
