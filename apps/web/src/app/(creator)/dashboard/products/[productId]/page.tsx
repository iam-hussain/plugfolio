import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getCreatorPage,
  getMyProfiles,
  getTraffic,
  listMyCategories,
  listProfileProducts,
} from "@plugfolio/core";
import {
  Button,
  DashBody,
  DashCard,
  DashCardHead,
  DashCardNote,
  DashCardTitle,
  PageHead,
  PageHeadActions,
  PageHeadTitle,
  ProductThumb,
  Provenance,
  Stat,
  UseRow,
  UsesList,
} from "@plugfolio/ui";
import { ChevronLeft } from "lucide-react";
import { ProductEditor } from "@/features/product-tagging";
import { formatNumber } from "@/lib/format-number";
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
  const libraryHref = `/dashboard/products?profile=${active.id}` as Route;
  // Used by, not owned by. Taken from the page read, which already carries
  // every post with its tagged products.
  const usedOn = (page?.posts ?? []).filter((post) =>
    post.products.some((tagged) => tagged.id === product.id),
  );
  const tapsByPost = new Map(traffic.byPost.map((row) => [row.postId, row.taps]));

  return (
    <>
      <PageHead>
        <PageHeadTitle
          eyebrow={
            <Link href={libraryHref} className="inline-flex items-center gap-1 no-underline">
              <ChevronLeft className="size-3.5" aria-hidden />
              All products
            </Link>
          }
        >
          {product.title}
        </PageHeadTitle>
        <PageHeadActions>
          <Button variant="outline" asChild>
            <Link href={`/${active.username}/product/${product.id}` as Route}>View as visitor</Link>
          </Button>
        </PageHeadActions>
      </PageHead>

      <DashBody>
        <ProductEditor
          profileId={active.id}
          categories={categories}
          libraryHref={libraryHref}
          product={{
            id: product.id,
            title: product.title,
            kind: product.kind,
            sourceUrl: product.sourceUrl,
            affiliateUrl: product.affiliateUrl,
            couponCode: product.couponCode,
            offerEndsAt: product.offerEndsAt,
            inStoreNote: product.inStoreNote,
            imageUrl: product.imageUrl,
            priceCents: product.priceCents,
            currency: product.currency,
            categoryId: product.categoryId,
          }}
        />

        {/* Two figures, two provenances. They were one line reading "221
            Tracked / Plus 71 code copies — redemption is not tracked", which
            buried the second number in a sentence and attached its caveat to
            nothing in particular. Each stands on its own now. */}
        <DashCard>
          <DashCardHead>
            <DashCardTitle>Traffic</DashCardTitle>
          </DashCardHead>
          <div className="grid gap-3 md:grid-cols-3">
            <Stat
              label="Views"
              value={formatNumber(measured?.views ?? 0)}
              provenance={<Provenance kind="tracked">Tracked</Provenance>}
            >
              This product&rsquo;s page opening.
            </Stat>
            <Stat
              label="Taps"
              value={formatNumber(measured?.taps ?? 0)}
              provenance={<Provenance kind="tracked">Tracked</Provenance>}
            >
              Someone left for the retailer from this product.
            </Stat>
            {product.couponCode ? (
              <Stat
                label="Code copies"
                value={formatNumber(measured?.codeCopies ?? 0)}
                provenance={<Provenance kind="untracked">Redemption not tracked</Provenance>}
              >
                We count the copy. What happens at the checkout is the retailer&rsquo;s side.
              </Stat>
            ) : null}
          </div>
        </DashCard>

        {usedOn.length > 0 ? (
          <DashCard>
            <DashCardHead>
              <DashCardTitle>On these posts</DashCardTitle>
              <DashCardNote>{usedOn.length} · editing here changes all of them</DashCardNote>
            </DashCardHead>
            <UsesList>
              {usedOn.map((post) => (
                <UseRow
                  key={post.id}
                  asChild
                  image={<ProductThumb src={post.mediaUrl} size="sm" />}
                  title={post.caption ?? "Untitled post"}
                  count={`${formatNumber(tapsByPost.get(post.id) ?? 0)} taps`}
                >
                  <Link href={`/dashboard/posts/${post.id}?profile=${active.id}` as Route} />
                </UseRow>
              ))}
            </UsesList>
          </DashCard>
        ) : null}
      </DashBody>
    </>
  );
}
