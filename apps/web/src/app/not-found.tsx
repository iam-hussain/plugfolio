import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button, cn, measure, FaultMark, SystemScreen } from "@plugfolio/ui";
import { exploreCreators } from "@plugfolio/core";
import { Logo } from "@/components/brand";
import { SiteFooter } from "@/components/chrome/site-footer";
import { repositories } from "@/server/container";

/**
 * 404 (DESIGN 404.html, design-handoff §5.25). A real route — the server
 * actually serves it — and it carries a SECURITY job: unknown, deleted, hidden
 * and foreign things (an unknown handle, a hidden post, someone else's collab
 * thread) all land here with identical words. "You don't have permission" would
 * confirm the thing exists, which is exactly what a stranger probing for a
 * private thread wants to learn, so this page never tries to say which happened.
 *
 * It is also the one moment to hand a lost visitor back to the product: shopping
 * never needs an account, so a mistyped handle becomes a wrong turn, not a dead
 * end — four real creators they can shop from right now.
 */
async function suggestedCreators() {
  // A 404 must render even when discovery can't — the suggestions are a bonus,
  // never a dependency. If the read fails, the page is still a good 404.
  try {
    const creators = await exploreCreators({ discovery: repositories.discovery });
    return creators.slice(0, 4);
  } catch {
    return [];
  }
}

export default async function NotFound() {
  const creators = await suggestedCreators();

  return (
    <div className="bg-background text-foreground flex min-h-dvh flex-col">
      <header className={cn(measure(), "flex items-center py-4")}>
        <Link href="/" aria-label="Plugfolio home" className="flex items-center">
          <Logo layout="horizontal" tone="auto" />
        </Link>
      </header>

      <main className="flex-1">
        <div className={measure()}>
          <SystemScreen
            mark={<FaultMark tempo="slow" tone="accent" />}
            title="This page doesn’t exist."
            lede="It may have been removed, or the link might be wrong. Nothing you did caused this."
            actions={
              <>
                <Button asChild variant="primary">
                  <Link href="/explore">Browse creators</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/">Go home</Link>
                </Button>
              </>
            }
          />

          {creators.length > 0 ? (
            <section className="border-border border-t py-[clamp(32px,5vw,52px)]">
              <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <h2 className="text-title font-extrabold tracking-[-0.02em]">While you’re here</h2>
                <Link
                  href="/explore"
                  className="text-muted-foreground hover:text-primary text-label ml-auto font-semibold"
                >
                  See all creators
                </Link>
              </div>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5">
                {creators.map((creator) => (
                  <li key={creator.id}>
                    <Link
                      href={`/${creator.username}` as Route}
                      className="bg-card shadow-rest hover:shadow-lift rounded-tile block p-2.5 no-underline transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px]"
                    >
                      <span className="bg-active rounded-image relative block aspect-square overflow-hidden">
                        {creator.latestMediaUrl ? (
                          /* ponytail: unoptimized until the import pipeline pins image domains */
                          <Image
                            src={creator.latestMediaUrl}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="mt-2.5 flex items-center gap-2">
                        <span className="bg-active text-brand-violet-deep rounded-pill text-micro grid size-6 shrink-0 place-items-center font-extrabold">
                          {creator.username.charAt(0).toUpperCase()}
                        </span>
                        <b className="text-label truncate font-bold">@{creator.username}</b>
                      </span>
                      <span className="text-faint text-micro mt-[5px] block">
                        {creator.postCount} posts · {creator.productCount} things
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground text-copy mt-[18px]">
                Shopping never needs an account — tap anything.
              </p>
            </section>
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
