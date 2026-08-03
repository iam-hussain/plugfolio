import type { WatchlistItem } from "@plugfolio/core";
import { Button, cn, EmptyState, measure } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { WatchButton } from "./watch-button";

/**
 * /saved — the things you saved, newest first, each card still carrying the
 * creator who tagged it ("who showed me this" is half of why it was saved).
 *
 * v2 (ADR-0026 / `Plugfolio v2.dc.html` §saved): a 2/3 grid of quiet cards —
 * the photograph, the mono "Thing · @user" line, the title, and Remove
 * inline. Deliberately **no price**: a shelf holds no price, reserves nothing
 * and buys nothing (§6.8) — every route out goes to that post or product's
 * own page, where the tap happens exactly as it would have the first time.
 *
 * Presentational: the route reads, this composes.
 */
export type WatchlistPageProps = {
  items: readonly WatchlistItem[];
};

export function WatchlistPage({ items }: WatchlistPageProps) {
  return (
    <main className={cn(measure(), "pb-[clamp(48px,7vw,88px)] pt-[clamp(20px,3vw,34px)]")}>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-display text-display font-bold leading-[1.08] tracking-[-0.04em]">
          Saved
        </h1>
        {items.length > 0 ? (
          <p className="text-faint text-nano m-0 font-mono tabular-nums tracking-[0.06em]">
            {items.length} saved
          </p>
        ) : null}
      </div>
      <p className="text-muted-foreground text-copy mt-2 max-w-[460px] leading-[1.55]">
        A shelf, not a cart. Nothing here is reserved, priced or held — each card just takes you
        back to where you found it.
      </p>

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
            Tap the bookmark on any post or thing and it lands here, still showing who put you
            onto it. Buying never needs an account — this is just your own shelf.
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-[18px] grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
          {items.map((item) => {
            return (
              <li key={`${item.kind}:${item.id}`}>
                <div className="border-border bg-card rounded-tile overflow-hidden border">
                  <Link
                    href={
                      item.kind === "post"
                        ? `/${item.creator.username}/post/${item.id}`
                        : `/${item.creator.username}/product/${item.id}`
                    }
                    aria-label={item.title}
                    className="bg-active relative block h-[150px] overflow-hidden"
                  >
                    {item.imageUrl ? (
                      /* ponytail: unoptimized until the social-import pipeline pins image domains */
                      <Image src={item.imageUrl} alt="" fill unoptimized className="object-cover" />
                    ) : null}
                  </Link>
                  <div className="px-3 pb-3 pt-3">
                    <p className="text-faint text-pico tracking-eyebrow truncate font-mono uppercase">
                      {item.kind === "post" ? "Post" : "Thing"} · @{item.creator.username}
                    </p>
                    {item.kind === "post" ? (
                      <Link
                        href={`/${item.creator.username}/post/${item.id}`}
                        className="text-label mt-1.5 block overflow-hidden font-medium leading-[1.4] no-underline [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <Link
                        href={`/${item.creator.username}/product/${item.id}`}
                        className="text-label mt-1.5 block overflow-hidden font-medium leading-[1.4] no-underline [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                      >
                        {item.title}
                      </Link>
                    )}
                    <div className="mt-2.5">
                      <WatchButton
                        kind={item.kind}
                        targetId={item.id}
                        isAuthenticated
                        initiallyWatched
                        verb="remove"
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
