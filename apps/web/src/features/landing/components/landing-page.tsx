import { cn, measure } from "@plugfolio/ui";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppTopBar, PillNav, PillNavProvider, SiteFooter } from "@/components/chrome";

/**
 * Landing (/) — the v2 marketing surface (ADR-0026, `Plugfolio v2.dc.html`
 * "stack" hero, the design's default): the lime no-login chip, the "Their
 * feed, with prices." display, a stack of three tilted product cards, then the
 * three-step strip, the live creators row, the ink "what we don't do" panel,
 * the two role doors and the four-column footer. Every claim here must be
 * true of the shipped product (§6.1).
 */

type StackCard = {
  photo: string;
  title: string;
  price: string;
  cta: string;
  href: Route;
  /** Resting transform utilities — static strings so the JIT sees them. */
  pose: string;
};

const STACK: readonly StackCard[] = [
  {
    photo: "shelf",
    title: "Studio tote — canvas",
    price: "₹1,850",
    cta: "Their store",
    href: "/explore" as Route,
    pose: "left-[2%] top-[8%] z-[1] w-[62%] -rotate-[7deg]",
  },
  {
    photo: "gym",
    title: "Wide-leg raw denim",
    price: "₹2,499",
    cta: "Nykaa Fashion",
    href: "/explore" as Route,
    pose: "left-[22%] top-0 z-[2] w-[64%] rotate-[4deg]",
  },
  {
    photo: "desk",
    title: "Warm desk lamp, matte",
    price: "₹3,400",
    cta: "Wakefit",
    href: "/explore" as Route,
    pose: "left-[36%] top-[32%] z-[3] w-[60%] -rotate-[2deg]",
  },
];

const STEPS = [
  {
    step: "01 / Find",
    title: "A creator you follow",
    copy: "One link in their bio holds everything they've ever shown you.",
  },
  {
    step: "02 / Tap",
    title: "Any post",
    copy: "Everything worn, used or recommended in it, listed with its price.",
  },
  {
    step: "03 / Buy",
    title: "At the retailer",
    copy: "You finish in a shop you already use. The creator gets credited there.",
  },
] as const;

const CREATORS = [
  { name: "Maya Rao", cat: "Thrift & everyday fashion", things: 126, photo: "gym", avatar: "maya" },
  { name: "Arjun Dev", cat: "Desk setups & tools", things: 88, photo: "desk", avatar: "arjun" },
  { name: "Nia Kapoor", cat: "Skin & routines", things: 143, photo: "beauty", avatar: "nia" },
  { name: "Rhea Nair", cat: "Home & small spaces", things: 171, photo: "shelf", avatar: "rhea" },
] as const;

const eyebrow = "text-faint text-pico tracking-eyebrow font-mono uppercase";

/** The lime chip — the one place lime appears with nothing on offer being the
    offer itself: "no login to shop" IS the deal. */
function NoLoginChip() {
  return (
    <span className="bg-accent text-accent-foreground rounded-pill text-pico tracking-eyebrow inline-flex items-center gap-2 py-1.5 pl-2 pr-3 font-mono font-bold uppercase">
      <span aria-hidden className="bg-accent-foreground size-1.5 rounded-pill" />
      No login to shop
    </span>
  );
}

export function LandingPage() {
  return (
    <PillNavProvider>
      <div className="bg-background text-foreground min-h-dvh">
        {/* The one shared top bar (components/chrome) — identical everywhere. */}
        <AppTopBar />

        <main id="main" className="pb-28">
          {/* ── Hero · the stack ── */}
          <section className={cn(measure(), "pt-9 lg:pt-14")}>
            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
              <div>
                <NoLoginChip />
                <h1 className="font-display text-display-2xl mt-5 font-bold leading-[0.94] tracking-[-0.05em]">
                  Their feed,
                  <br />
                  with prices.
                </h1>
                <p className="text-muted-foreground text-body mt-5 max-w-[430px] text-pretty leading-[1.6]">
                  Everything a creator wears, uses or recommends, stacked in one link — each card
                  takes you to the shop that sells it.
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Link
                    href="/explore"
                    className="bg-primary text-primary-foreground font-display text-copy rounded-pill px-6 py-3.5 font-semibold transition-transform hover:-translate-y-px"
                  >
                    Start shopping →
                  </Link>
                  <Link
                    href="/explore"
                    className="border-border-strong font-display text-copy rounded-pill border px-6 py-3.5 font-semibold transition-transform hover:-translate-y-px"
                  >
                    See a live page
                  </Link>
                </div>
              </div>

              <div className="relative h-[360px] lg:h-[400px]">
                {STACK.map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className={cn(
                      "border-border-strong bg-card rounded-sheet absolute block overflow-hidden border",
                      "shadow-[0_22px_44px_-20px_rgba(18,16,28,.28)] transition-transform duration-150 hover:-translate-y-0.5",
                      card.pose,
                    )}
                  >
                    <span className="block h-[150px] overflow-hidden lg:h-[176px]">
                      <Image
                        src={`/landing/posts/${card.photo}.jpg`}
                        alt=""
                        width={420}
                        height={460}
                        className="size-full object-cover"
                      />
                    </span>
                    <span className="block px-3.5 pb-3.5 pt-[11px]">
                      <span className="text-label block font-semibold leading-[1.35]">
                        {card.title}
                      </span>
                      <span className="mt-2 flex items-center justify-between gap-2">
                        <span className="font-display text-label font-bold tabular-nums">
                          {card.price}
                        </span>
                        <span className="bg-primary text-primary-foreground rounded-pill text-pico tracking-eyebrow px-2.5 py-[5px] font-mono font-bold uppercase">
                          {card.cta}
                        </span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── The three-step strip ── */}
          <section className={cn(measure(), "mt-10")}>
            <div className="border-border bg-card rounded-card overflow-hidden border">
              <div className="grid lg:grid-cols-3">
                {STEPS.map((item, index) => (
                  <div
                    key={item.step}
                    className={cn(
                      "px-[22px] py-5",
                      index > 0 && "border-border border-t lg:border-l lg:border-t-0",
                    )}
                  >
                    <p className={eyebrow}>{item.step}</p>
                    <h2 className="font-display text-body mt-2 font-semibold tracking-[-0.02em]">
                      {item.title}
                    </h2>
                    <p className="text-muted-foreground text-label mt-1.5 leading-[1.55]">
                      {item.copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Live right now ── */}
          <section className={cn(measure(), "mt-14")}>
            <p className={eyebrow}>Live right now</p>
            <h2 className="font-display text-name mt-2 font-bold tracking-[-0.035em]">
              Shop someone&apos;s page
            </h2>
            <ul className="mt-[18px] grid grid-cols-2 gap-3 lg:grid-cols-4">
              {CREATORS.map((creator) => (
                <li key={creator.name}>
                  <Link
                    href="/explore"
                    className="border-border bg-card rounded-tile block overflow-hidden border transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-primary"
                  >
                    <span className="block h-[126px] overflow-hidden">
                      <Image
                        src={`/landing/posts/${creator.photo}.jpg`}
                        alt=""
                        width={480}
                        height={320}
                        className="size-full object-cover"
                      />
                    </span>
                    <span className="block px-3.5 pb-[15px] pt-[13px]">
                      <span className="font-display text-copy block font-semibold tracking-[-0.02em]">
                        {creator.name}
                      </span>
                      <span className="text-muted-foreground text-label mt-0.5 block">
                        {creator.cat}
                      </span>
                      <span className="text-faint text-nano mt-2.5 block font-mono tracking-[0.06em]">
                        {creator.things} things tagged
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* ── The ink panel: what we don't do ── */}
          <section className={cn(measure(), "mt-14")}>
            <div className="bg-brand-ink rounded-card p-[26px] text-[#F5F4F8] lg:p-10">
              <p className="text-accent text-pico tracking-eyebrow font-mono uppercase">
                What we don&apos;t do
              </p>
              <h2 className="font-display text-display-lg mt-3 max-w-[640px] font-bold leading-[1.1] tracking-[-0.04em]">
                No cart. No checkout. No wallet. We never see your card.
              </h2>
              <div className="mt-6 grid gap-3.5 lg:grid-cols-2">
                <p className="text-copy border-t border-white/15 pt-3 leading-[1.55] text-white/70">
                  Every Buy hands you to the retailer&apos;s own store. The creator is credited by
                  that retailer&apos;s affiliate network — not by you, and not by us.
                </p>
                <p className="text-copy border-t border-white/15 pt-3 leading-[1.55] text-white/70">
                  The only thing we measure is the tap out. No estimated earnings, no invented
                  numbers, nothing that needs your account to work.
                </p>
              </div>
            </div>
          </section>

          {/* ── The two role doors ── */}
          <section className={cn(measure(), "mt-[22px] grid gap-3 lg:grid-cols-2")}>
            {[
              {
                eyebrow: "For creators",
                title: "Your reel, shoppable in five minutes",
                copy: "Connect Instagram or YouTube, your posts import themselves, tag the things, drop one link in your bio.",
                go: "Claim your handle →",
                href: "/join?as=creator" as Route,
              },
              {
                eyebrow: "For business",
                title: "Brief it once, hear from creators",
                copy: "Post a requirement or approach a creator directly. One thread for content, price and deadline. Payment settles off-platform.",
                go: "Open collabs →",
                href: "/join?as=business" as Route,
              },
            ].map((door) => (
              <Link
                key={door.eyebrow}
                href={door.href}
                className="border-border bg-card rounded-sheet block border p-[22px] transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-primary"
              >
                <p className="text-primary text-pico tracking-eyebrow font-mono uppercase">
                  {door.eyebrow}
                </p>
                <h2 className="font-display text-title mt-2.5 font-bold tracking-[-0.03em]">
                  {door.title}
                </h2>
                <p className="text-muted-foreground text-copy mt-2 leading-[1.55]">{door.copy}</p>
                <p className="text-primary text-copy mt-4 font-semibold">{door.go}</p>
              </Link>
            ))}
          </section>
        </main>

        {/* The one shared footer — v2 carries it only here. */}
        <SiteFooter />
        <PillNav />
      </div>
    </PillNavProvider>
  );
}
