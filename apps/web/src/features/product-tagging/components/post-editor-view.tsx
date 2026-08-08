import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CategoryView, CreatorProductRow, ShopperPost, TrafficSummary } from "@plugfolio/core";
import {
  Button,
  DashBody,
  DashCard,
  DashCardHead,
  DashCardNote,
  DashCardTitle,
  EditorGrid,
  EditorMedia,
  EmptyState,
  HiddenBanner,
  IconAction,
  IconActions,
  MetaDot,
  PageHead,
  PageHeadActions,
  PageHeadTitle,
  Pill,
  ProductRow,
  ProductRows,
  ProductThumb,
  Provenance,
  Stat,
  Stats,
} from "@plugfolio/ui";
import { ChevronLeft, Link2Off, Pencil } from "lucide-react";
import { formatNumber } from "@/lib/format-number";
import { formatPrice } from "@/lib/format-price";
import { PostForm } from "./post-form";
import { DisconnectProductButton, ProductConnector } from "./product-connector";
import { PostVisibilitySwitch } from "./hide-post-button";

/**
 * The post editor (DESIGN post-edit.html) — the media, the caption/shelf form,
 * this post's traffic, and the products connected to it with a way to connect
 * more, alongside a live preview of what a shopper sees.
 *
 * The route above it loads and nothing else (§5: `app/` is thin).
 */
export type PostEditorViewProps = {
  profileId: string;
  /** The active profile's @username — drives the "view as visitor" link. */
  username: string;
  post: ShopperPost;
  categories: readonly CategoryView[];
  /** Products connectable to this post — the library minus what's already on it. */
  connectable: readonly CreatorProductRow[];
  /** This post's tracked traffic; null when it has none yet. */
  measured: TrafficSummary["byPost"][number] | undefined;
};

export function PostEditorView({
  profileId,
  username,
  post,
  categories,
  connectable,
  measured,
}: PostEditorViewProps) {
  const postsHref = `/dashboard/posts?profile=${profileId}` as Route;
  const hidden = post.hiddenAt !== null;

  return (
    <>
      <PageHead>
        <PageHeadTitle
          eyebrow={
            <Link href={postsHref} className="inline-flex items-center gap-1 no-underline">
              <ChevronLeft className="size-3.5" aria-hidden />
              All posts
            </Link>
          }
        >
          {post.caption ?? "Untitled post"}
        </PageHeadTitle>
        <PageHeadActions>
          <div className="flex items-center gap-2.5">
            <PostVisibilitySwitch profileId={profileId} postId={post.id} hidden={hidden} />
          </div>
          <Button variant="outline" asChild>
            <Link href={`/${username}/post/${post.id}` as Route}>View as visitor</Link>
          </Button>
        </PageHeadActions>
      </PageHead>

      <DashBody>
        {/* Hidden is a state of the whole screen, not a badge in a corner. */}
        {hidden ? (
          <HiddenBanner>
            Hidden from your public page — visitors can&rsquo;t see this post until you show it
            again.
          </HiddenBanner>
        ) : null}

        <EditorGrid>
          <div>
            <EditorMedia dimmed={hidden}>
              <Image
                src={post.mediaUrl}
                alt={post.caption ?? "Post"}
                width={1200}
                height={800}
                unoptimized
                sizes="(min-width: 940px) 42vw, 100vw"
                className="block h-auto w-full"
                priority
              />
            </EditorMedia>

            <div className="mt-3.5">
              <PostForm
                profileId={profileId}
                categories={categories}
                post={{
                  id: post.id,
                  mediaUrl: post.mediaUrl,
                  mediaKind: post.mediaKind,
                  embedUrl: post.embedUrl,
                  sourceUrl: post.sourceUrl,
                  caption: post.caption,
                  categoryId: post.categoryId,
                }}
              />
            </div>

            <DashCard>
              <DashCardHead>
                <DashCardTitle className="text-label">Traffic</DashCardTitle>
              </DashCardHead>
              <Stats className="md:grid-cols-2">
                <Stat
                  label="Views"
                  value={formatNumber(measured?.views ?? 0)}
                  provenance={<Provenance kind="tracked">Tracked</Provenance>}
                />
                <Stat
                  label="Taps"
                  value={formatNumber(measured?.taps ?? 0)}
                  provenance={<Provenance kind="tracked">Tracked</Provenance>}
                />
              </Stats>
            </DashCard>
          </div>

          {/* ONE card. The connected products and the way to connect another
              belong together, the way a list and its ＋ always do. */}
          <DashCard>
            <DashCardHead>
              <DashCardTitle>Products on this post</DashCardTitle>
              <DashCardNote>
                {post.products.length > 0
                  ? `${post.products.length} · live on your page now`
                  : "None yet"}
              </DashCardNote>
            </DashCardHead>

            {post.products.length === 0 ? (
              <EmptyState title="Nothing connected yet">
                Connect a product and this post becomes shoppable.
              </EmptyState>
            ) : (
              /* Read-only on purpose. Everything shown belongs to the product,
                 so the row reports it and links out — the one editable thing
                 about a product FROM a post is whether it is on this post. */
              <ProductRows>
                {post.products.map((product) => (
                  <ProductRow
                    key={product.id}
                    image={<ProductThumb src={product.imageUrl} />}
                    title={product.title}
                    price={formatPrice(product.priceCents, product.currency)}
                    badges={
                      <>
                        {product.kind === "own" ? <Pill tone="own">Their own</Pill> : null}
                        {product.couponCode ? (
                          <Pill tone="code">Code {product.couponCode}</Pill>
                        ) : null}
                      </>
                    }
                    meta={
                      <>
                        <span>{product.kind === "own" ? "Own store" : "Affiliate"}</span>
                        <MetaDot />
                        <span>
                          {product.affiliateUrl ? "has a link" : "in-store only · no link"}
                        </span>
                      </>
                    }
                    action={
                      <IconActions>
                        <IconAction label={`Edit ${product.title}`} asChild>
                          <Link
                            href={`/dashboard/products/${product.id}?profile=${profileId}` as Route}
                          >
                            <Pencil aria-hidden />
                          </Link>
                        </IconAction>
                        <DisconnectProductButton
                          postId={post.id}
                          productId={product.id}
                          title={product.title}
                        >
                          <Link2Off aria-hidden />
                        </DisconnectProductButton>
                      </IconActions>
                    }
                  />
                ))}
              </ProductRows>
            )}

            <ProductConnector
              postId={post.id}
              products={connectable}
              newProductHref={
                `/dashboard/products/new?profile=${profileId}&post=${post.id}` as Route
              }
            />

            {/* The live preview §7.4 requires — a window onto the public
                card, updating as products connect (v2 §Post editor). */}
            <div className="bg-active border-border-strong rounded-sheet mt-3.5 border p-3.5">
              <p className="text-faint text-pico tracking-eyebrow mb-2.5 font-mono font-bold uppercase">
                What a shopper will see
              </p>
              <div className="border-border bg-card overflow-hidden rounded-lg border">
                <span className="bg-active block h-[150px] overflow-hidden">
                  <Image
                    src={post.mediaUrl}
                    alt=""
                    width={600}
                    height={300}
                    unoptimized
                    className="size-full object-cover"
                  />
                </span>
                <span className="block px-3 py-[11px]">
                  <span className="text-label block leading-[1.4]">
                    {post.caption ?? "Untitled post"}
                  </span>
                  <span className="text-primary text-pico tracking-eyebrow mt-2 block font-mono uppercase">
                    {post.products.length > 0
                      ? `In this post — ${post.products.length} thing${post.products.length === 1 ? "" : "s"}`
                      : "Nothing tagged yet"}
                  </span>
                </span>
              </div>
            </div>
          </DashCard>
        </EditorGrid>
      </DashBody>
    </>
  );
}
