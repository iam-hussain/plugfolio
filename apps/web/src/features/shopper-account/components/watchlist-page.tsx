import type { WatchlistItem } from "@plugfolio/core";
import {
  Button,
  cn,
  DiscoveryAvatar,
  DiscoveryCard,
  DiscoveryGrid,
  discoveryTone,
  EmptyState,
  measure,
} from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import { WatchButton } from "./watch-button";

/**
 * /watchlist — the things you saved, newest first, each one still carrying the
 * creator who tagged it.
 *
 * Same card as Explore (`DiscoveryCard`), deliberately: a saved thing is the
 * same object it was when you saved it, and a shopper shouldn't have to relearn
 * a card between the two screens.
 *
 * The same line /following walks: this is a list, not a feed. Nothing here is
 * merged into a stream you scroll and buy from, and no card buys anything —
 * every route out goes to that post or product's own page, where the outbound
 * tap and its attribution happen.
 *
 * Presentational: the route reads, this composes.
 */
export type WatchlistPageProps = {
  items: readonly WatchlistItem[];
};

/** Lime means a live offer and prints the code; violet marks the creator's own. */
function itemFlag(item: WatchlistItem, now: Date): { label: string; tone: "offer" | "own" } | null {
  if (item.couponCode && (!item.offerEndsAt || item.offerEndsAt > now)) {
    return { label: `Code ${item.couponCode}`, tone: "offer" };
  }
  return item.productKind === "own" ? { label: "Their own", tone: "own" } : null;
}

export function WatchlistPage({ items }: WatchlistPageProps) {
  const now = new Date();

  return (
    <main className={cn(measure(), "pb-[clamp(48px,7vw,88px)] pt-[clamp(20px,3vw,34px)]")}>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-display text-display font-bold leading-[1.08] tracking-[-0.035em]">
          Saved
        </h1>
        {items.length > 0 ? (
          <p className="text-muted-foreground text-copy m-0 font-semibold tabular-nums">
            {items.length} saved
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-[26px]">
          <EmptyState
            title="Nothing saved yet."
            action={
              <Button asChild>
                <Link href="/explore">Find something</Link>
              </Button>
            }
          >
            Save a post or a product from any creator&apos;s page and it waits here. Buying never
            needs an account — this is just your own shelf.
          </EmptyState>
        </div>
      ) : (
        <DiscoveryGrid>
          {items.map((item, index) => (
            <div key={`${item.kind}:${item.id}`} className="relative">
              <DiscoveryCard
                tone={discoveryTone(index)}
                avatar={
                  <DiscoveryAvatar
                    initial={item.creator.username.charAt(0).toUpperCase()}
                    src={item.creator.avatarUrl}
                  />
                }
                handle={`@${item.creator.username}`}
                title={
                  /* Inline, not a helper: Next infers the typed route from the
                     literal at the call site. */
                  item.kind === "post" ? (
                    <Link href={`/${item.creator.username}/post/${item.id}`}>{item.title}</Link>
                  ) : (
                    <Link href={`/${item.creator.username}/product/${item.id}`}>{item.title}</Link>
                  )
                }
                stat={
                  item.kind === "product"
                    ? (formatPrice(item.priceCents, item.currency ?? "usd") ?? "See price")
                    : "Post"
                }
                action={
                  item.kind === "post" ? "Open →" : item.productKind === "own" ? "Shop →" : "Buy →"
                }
                flag={itemFlag(item, now)}
                media={
                  item.imageUrl ? (
                    /* ponytail: unoptimized until the social-import pipeline pins image domains */
                    <Image
                      src={item.imageUrl}
                      alt=""
                      width={480}
                      height={600}
                      unoptimized
                      className="size-full object-cover"
                    />
                  ) : null
                }
              />
              {/* Above the card's stretched link, never inside it: a button
                  nested in a link is how someone unsaves by accident. */}
              <div className="absolute right-3.5 top-3.5 z-20">
                <WatchButton
                  kind={item.kind}
                  targetId={item.id}
                  isAuthenticated
                  initiallyWatched
                  display="icon"
                />
              </div>
            </div>
          ))}
        </DiscoveryGrid>
      )}
    </main>
  );
}
