import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getMyProfiles, getShopperPost, getTraffic, listMyCategories } from "@plugfolio/core";
import {
  Button,
  DashBody,
  DashCard,
  DashCardHead,
  DashCardNote,
  DashCardTitle,
  EmptyState,
  Hint,
  IconAction,
  MetaDot,
  Pill,
  ProductRow,
  ProductRows,
  Provenance,
  Stat,
  Stats,
} from "@plugfolio/ui";
import { ImageOff, Pencil } from "lucide-react";
import {
  CategorySelect,
  DashboardPageHeader,
  DashboardShell,
  PostVisibilitySwitch,
  TagProductForm,
} from "@/features/product-tagging";
import { formatPrice } from "@/lib/format-price";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The post editor (DESIGN post-edit.html; dashboard.html §5.19 sends every row
// here). A focused workspace: the post, its shelf, what's tagged on it, the
// paste-a-URL form, and what it earned. Publish-free — tags go live as they're
// added, because a draft state is a second thing to remember.
export const metadata: Metadata = { title: "Edit post" };

type Params = { postId: string };
type SearchParams = { profile?: string };

const number = new Intl.NumberFormat("en");

export default async function TagPostPage({
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
  const [post, categories, traffic] = await Promise.all([
    getShopperPost({ creatorPages: repositories.creatorPages }, active.username, postId),
    listMyCategories(
      { profiles: repositories.profiles, categories: repositories.categories },
      session.user.id,
      active.id,
    ),
    getTraffic({ traffic: repositories.traffic }, active.id),
  ]);
  if (!post) notFound();

  const measured = traffic.byPost.find((row) => row.postId === post.id);

  return (
    <DashboardShell profiles={profiles} active={active}>
      <DashboardPageHeader
        title={post.caption ?? "Untitled post"}
        eyebrow={`@${active.username} · post`}
        action={
          <>
            <div className="flex items-center gap-2.5">
              <PostVisibilitySwitch
                profileId={active.id}
                postId={post.id}
                hidden={post.hiddenAt !== null}
              />
            </div>
            <Button variant="outline" asChild>
              <Link href={`/${active.username}/post/${post.id}` as Route}>View as visitor</Link>
            </Button>
          </>
        }
      />

      <DashBody>
        {post.hiddenAt ? (
          <Hint>
            Hidden from your public page — visitors can&rsquo;t see this post until you show it
            again. It is still yours, still listed, still editable; only its public URL is gone.
          </Hint>
        ) : null}

        <div className="grid gap-3.5 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div>
            <DashCard>
              <div className="bg-active rounded-image relative aspect-square overflow-hidden">
                <Image
                  src={post.mediaUrl}
                  alt={post.caption ?? "Post"}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 320px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
              {post.caption ? (
                <p className="text-copy text-muted-foreground mt-3.5">{post.caption}</p>
              ) : null}
            </DashCard>

            <DashCard>
              <DashCardHead>
                <DashCardTitle className="text-label">Shelf</DashCardTitle>
              </DashCardHead>
              <CategorySelect
                target={{ kind: "post", postId: post.id, profileId: active.id }}
                categories={categories}
                currentCategoryId={post.categoryId}
              />
            </DashCard>

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

          <div>
            <DashCard>
              <DashCardHead>
                <DashCardTitle>Tagged products</DashCardTitle>
                {post.products.length > 0 ? (
                  <DashCardNote>{post.products.length}</DashCardNote>
                ) : null}
              </DashCardHead>
              {post.products.length === 0 ? (
                <EmptyState title="Nothing tagged yet">
                  Paste a product URL below and this post becomes shoppable.
                </EmptyState>
              ) : (
                /* Read-only on purpose. Everything shown belongs to the
                   product, so the row reports it and links out — the one
                   editable thing about a product FROM a post is whether it is
                   on this post at all. */
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
                        <IconAction label={`Edit ${product.title}`} asChild>
                          <Link
                            href={`/dashboard/products/${product.id}?profile=${active.id}` as Route}
                          >
                            <Pencil aria-hidden />
                          </Link>
                        </IconAction>
                      }
                    />
                  ))}
                </ProductRows>
              )}
            </DashCard>

            <DashCard>
              <DashCardHead>
                <DashCardTitle>Tag a product</DashCardTitle>
              </DashCardHead>
              <Hint>
                Paste the product URL. Plugfolio grabs the image, title and price; the link stays
                yours, and nothing rewrites it.
              </Hint>
              <TagProductForm profileId={active.id} postId={post.id} />
            </DashCard>
          </div>
        </div>
      </DashBody>
    </DashboardShell>
  );
}
