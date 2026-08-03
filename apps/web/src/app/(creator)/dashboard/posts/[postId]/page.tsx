import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getMyProfiles,
  getShopperPost,
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
  Provenance,
  Stat,
  Stats,
} from "@plugfolio/ui";
import { ChevronLeft, ImageOff, Link2Off, Pencil } from "lucide-react";
import {
  DisconnectProductButton,
  PostForm,
  PostVisibilitySwitch,
  ProductConnector,
} from "@/features/product-tagging";
import { formatPrice } from "@/lib/format-price";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The post editor (DESIGN post-edit.html). Its own page, not a tab: tagging is
// the longest single task a creator does and the one they come back to, and
// sharing a route with the Posts list meant Back went to the dashboard rather
// than to the list — and the URL could not be sent to a Manager.
//
// Publish-free: a tag is live the moment it is added, so there is no draft
// state to explain and no Publish button to forget.
export const metadata: Metadata = { title: "Edit post" };

type Params = { postId: string };
type SearchParams = { profile?: string };

const number = new Intl.NumberFormat("en");

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, (await searchParams).profile);
  if (!active) redirect("/dashboard");

  const { postId } = await params;
  // Scoped by the creator's own username — another profile's post is a 404.
  const [post, categories, library, traffic] = await Promise.all([
    getShopperPost({ creatorPages: repositories.creatorPages }, active.username, postId),
    listMyCategories(
      { profiles: repositories.profiles, categories: repositories.categories },
      session.user.id,
      active.id,
    ),
    listProfileProducts({ creatorPages: repositories.creatorPages }, active.username),
    getTraffic({ traffic: repositories.traffic }, active.id),
  ]);
  if (!post) notFound();

  const measured = traffic.byPost.find((row) => row.postId === post.id);
  const taggedIds = new Set(post.products.map((product) => product.id));
  const connectable = library.filter((product) => !taggedIds.has(product.id));
  const postsHref = `/dashboard/posts?profile=${active.id}` as Route;
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
            <PostVisibilitySwitch profileId={active.id} postId={post.id} hidden={hidden} />
          </div>
          <Button variant="outline" asChild>
            <Link href={`/${active.username}/post/${post.id}` as Route}>View as visitor</Link>
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
                profileId={active.id}
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
                  value={number.format(measured?.views ?? 0)}
                  provenance={<Provenance kind="tracked">Tracked</Provenance>}
                />
                <Stat
                  label="Taps"
                  value={number.format(measured?.taps ?? 0)}
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
                    image={
                      <span className="bg-active rounded-image relative size-[52px] flex-none overflow-hidden">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt=""
                            fill
                            unoptimized
                            sizes="52px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-faint grid size-full place-items-center">
                            <ImageOff className="size-5" aria-hidden />
                          </span>
                        )}
                      </span>
                    }
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
                            href={`/dashboard/products/${product.id}?profile=${active.id}` as Route}
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
                `/dashboard/products/new?profile=${active.id}&post=${post.id}` as Route
              }
            />

            {/* The live preview §7.4 requires — a window onto the public
                card, updating as products connect (v2 §Post editor). */}
            <div className="bg-active border-border-strong rounded-sheet mt-3.5 border p-3.5">
              <p className="text-faint text-pico tracking-eyebrow mb-2.5 font-mono font-bold uppercase">
                What a shopper will see
              </p>
              <div className="border-border bg-card rounded-lg overflow-hidden border">
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
