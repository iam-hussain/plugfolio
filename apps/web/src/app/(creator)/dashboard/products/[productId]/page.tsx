import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getMyProfiles, getTraffic, listMyCategories, listProfileProducts } from "@plugfolio/core";
import {
  Button,
  DashBody,
  DashCard,
  DashCardHead,
  DashCardTitle,
  MetaDot,
  Pill,
  Provenance,
  Stat,
  Stats,
} from "@plugfolio/ui";
import { ImageOff } from "lucide-react";
import { DashboardPageHeader, ProductEditor } from "@/features/product-tagging";
import { formatPrice } from "@/lib/format-price";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The product page (DESIGN product-edit.html). One screen owns a product:
// where it goes, its coupon, its shelf, and the one destructive action —
// plus the numbers it earned, shown where the thing that earned them is.
export const metadata: Metadata = { title: "Edit product" };

type Params = { productId: string };
type SearchParams = { profile?: string };

const number = new Intl.NumberFormat("en");

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

  const [products, categories, traffic] = await Promise.all([
    listProfileProducts({ creatorPages: repositories.creatorPages }, active.username),
    listMyCategories(
      { profiles: repositories.profiles, categories: repositories.categories },
      session.user.id,
      active.id,
    ),
    getTraffic({ traffic: repositories.traffic }, active.id),
  ]);
  const product = products.find((row) => row.id === productId);
  if (!product) notFound();

  const measured = traffic.byProduct.find((row) => row.productId === product.id);
  const price = formatPrice(product.priceCents, product.currency);
  const libraryHref = `/dashboard/products?profile=${active.id}` as Route;

  return (
    <>
      <DashboardPageHeader
        title={product.title}
        eyebrow={`@${active.username} · product`}
        action={
          <Button variant="outline" asChild>
            <Link href={libraryHref}>All products</Link>
          </Button>
        }
      />

      <DashBody>
        <DashCard>
          <div className="flex flex-wrap items-center gap-3.5">
            <span className="bg-active rounded-image relative size-[72px] flex-none overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="72px"
                  className="object-cover"
                />
              ) : (
                <span className="text-faint grid size-full place-items-center">
                  <ImageOff className="size-6" aria-hidden />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-[1_1_220px]">
              <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
                <b className="text-label font-bold">{product.title}</b>
                {price ? (
                  <span className="text-label font-extrabold tabular-nums">{price}</span>
                ) : null}
                {product.kind === "own" ? <Pill tone="own">Their own</Pill> : null}
                {product.couponCode ? <Pill tone="code">Code {product.couponCode}</Pill> : null}
              </span>
              <span className="text-muted-foreground text-micro mt-[5px] flex flex-wrap gap-x-1.5">
                <span>
                  on {product.postCount} {product.postCount === 1 ? "post" : "posts"}
                </span>
                <MetaDot />
                <span>{product.kind === "own" ? "Own store" : "Affiliate"}</span>
              </span>
            </span>
          </div>
        </DashCard>

        {/* The numbers belong beside the thing that earned them, and they wear
            the same provenance labels the dashboard uses. */}
        <DashCard>
          <DashCardHead>
            <DashCardTitle>Traffic</DashCardTitle>
          </DashCardHead>
          <Stats className={product.couponCode ? undefined : "md:grid-cols-2"}>
            <Stat
              label="Views"
              value={number.format(measured?.views ?? 0)}
              provenance={<Provenance kind="tracked">Tracked</Provenance>}
            >
              This product&rsquo;s page opening.
            </Stat>
            <Stat
              label="Taps"
              value={number.format(measured?.taps ?? 0)}
              provenance={<Provenance kind="tracked">Tracked</Provenance>}
            >
              Someone leaving for the retailer.
            </Stat>
            {product.couponCode ? (
              <Stat
                label="Code copies"
                value={number.format(measured?.codeCopies ?? 0)}
                provenance={<Provenance kind="untracked">Redemption not tracked</Provenance>}
              >
                Copies are counted here; whether the code was used happens where we cannot see it.
              </Stat>
            ) : null}
          </Stats>
        </DashCard>

        <ProductEditor product={product} categories={categories} onRemovedHref={libraryHref} />
      </DashBody>
    </>
  );
}
