import type { WatchlistItem } from "@plugfolio/core";
import { Button, cn, EmptyState, measure, ThingCard, ThingsGrid } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import { WatchButton } from "./watch-button";

/**
 * /watchlist — the things you saved, newest first, each one still carrying the
 * creator who tagged it.
 *
 * The same line /following walks: this is a list, not a feed. Nothing here is
 * merged into a stream you scroll and buy from, and no card buys anything —
 * every route out goes to that post or product's own page, where the outbound
 * tap and its attribution happen. Posts and products share one grid because
 * they answer the same question ("what did I want to come back to?").
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
          Watchlist
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
        <ThingsGrid>
          {items.map((item) => (
            <div key={`${item.kind}:${item.id}`} className="relative">
              <ThingCard
                asChild
                title={item.title}
                by={`by @${item.creator.username}`}
                price={
                  item.kind === "product"
                    ? formatPrice(item.priceCents, item.currency ?? "usd")
                    : null
                }
                go={
                  item.kind === "post" ? "Open →" : item.productKind === "own" ? "Shop →" : "Buy →"
                }
                flag={itemFlag(item, now)}
                image={
                  item.imageUrl ? (
                    /* ponytail: unoptimized until the social-import pipeline pins image domains */
                    <Image
                      src={item.imageUrl}
                      alt=""
                      width={480}
                      height={480}
                      unoptimized
                      className="size-full object-cover"
                    />
                  ) : null
                }
              >
                {/* Inline, not a helper: Next infers the typed route from the
                    literal at the call site. */}
                <Link
                  href={
                    item.kind === "post"
                      ? `/${item.creator.username}/post/${item.id}`
                      : `/${item.creator.username}/product/${item.id}`
                  }
                />
              </ThingCard>
              {/* Outside the card, never inside it: the card is one link, and a
                  button nested in a link is how someone unsaves by accident. */}
              <div className="absolute right-4 top-4">
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
        </ThingsGrid>
      )}
    </main>
  );
}
