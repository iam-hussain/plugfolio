import type { Route } from "next";
import Link from "next/link";
import type { CategoryView, CreatorProductRow, ShopperPost, TrafficSummary } from "@plugfolio/core";
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
import { formatNumber } from "@/lib/format-number";
import { ProductEditor } from "./product-editor";

/**
 * The product page (DESIGN product-edit.html) — the editor form, this product's
 * traffic, and the posts it is used on (a consequence, not a container).
 *
 * The route above it loads and nothing else (§5: `app/` is thin).
 */
export type ProductEditorViewProps = {
  profileId: string;
  /** The active profile's @username — drives the "view as visitor" link. */
  username: string;
  product: CreatorProductRow;
  categories: readonly CategoryView[];
  /** This product's tracked traffic; undefined when it has none yet. */
  measured: TrafficSummary["byProduct"][number] | undefined;
  /** The posts this product is tagged on — used by, not owned by. */
  usedOn: readonly ShopperPost[];
  /** Taps per post, so each "used on" row can carry its own number. */
  tapsByPost: Map<string, number>;
};

export function ProductEditorView({
  profileId,
  username,
  product,
  categories,
  measured,
  usedOn,
  tapsByPost,
}: ProductEditorViewProps) {
  const libraryHref = `/dashboard/products?profile=${profileId}` as Route;

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
            <Link href={`/${username}/product/${product.id}` as Route}>View as visitor</Link>
          </Button>
        </PageHeadActions>
      </PageHead>

      <DashBody>
        <ProductEditor
          profileId={profileId}
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
                  <Link href={`/dashboard/posts/${post.id}?profile=${profileId}` as Route} />
                </UseRow>
              ))}
            </UsesList>
          </DashCard>
        ) : null}
      </DashBody>
    </>
  );
}
