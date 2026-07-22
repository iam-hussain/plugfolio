import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberHandle, getProductComments, getShopperProduct } from "@plugfolio/core";
import { CouponBlock, ProductTapButton } from "@/features/creator-page";
import { CommentForm, CommentList } from "@/features/shopper-account";
import { formatPrice } from "@/lib/format-price";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Product page (brief 03 + 13): photo, price, the post it came from, one
// outbound action — plus its own comment thread (ADR-0013). The buy path
// stays account-free (ADR-0002, §2.2); a session only enriches.
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
      {product.kind === "own" ? (
        <p className="text-muted-foreground pt-1 text-sm">Their own product</p>
      ) : null}
      {product.couponCode ? (
        <div className="pt-4">
          <CouponBlock
            productId={product.id}
            postId={product.fromPost?.id}
            couponCode={product.couponCode}
            offerEndsAt={product.offerEndsAt}
            inStoreNote={product.inStoreNote}
          />
        </div>
      ) : null}
      {product.affiliateUrl ? (
        <div className="pt-4">
          <ProductTapButton
            productId={product.id}
            postId={product.fromPost?.id}
            affiliateUrl={product.affiliateUrl}
            source="product"
            label={product.kind === "own" ? "Shop their store" : "Buy"}
          />
        </div>
      ) : null}
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
      <section aria-label="Comments" className="pt-8">
        <h2 className="pb-3 font-medium">Comments</h2>
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
            <p className="text-muted-foreground text-sm">
              <Link href="/api/auth/signin" className="underline">
                Sign in
              </Link>{" "}
              to comment — shopping never needs an account.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
