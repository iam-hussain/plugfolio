import { Button, ProductTag, Tile } from "@plugfolio/ui";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand";

/**
 * Landing (/) — the "Tagged Feed" world (DESIGN.md), a Persuade surface.
 * Three sections: the deck hero (a fan of tilted shoppable post cards), the
 * three-tap trail on colour tiles, and the "pick your side" bento. Canvas
 * ground, ink pill CTAs, product tags pinned straight onto the photography.
 * All colour and type comes from tokens; positions and tilts are utility
 * classes, never inline styles.
 */

type DeckCard = {
  handle: string;
  photo: string;
  avatar: string;
  product: string;
  price: string;
  tagged: number;
  tone: "affiliate" | "offer" | "own";
  href: string;
};

const DECK: readonly DeckCard[] = [
  { handle: "mayamoves", photo: "gym", avatar: "maya", product: "Runners", price: "₹6,499", tagged: 4, tone: "affiliate", href: "/mayamoves" },
  { handle: "niaglow", photo: "beauty", avatar: "nia", product: "Lip tint", price: "₹749", tagged: 6, tone: "offer", href: "/niaglow" },
  { handle: "arjunbuilds", photo: "desk", avatar: "arjun", product: "Keyboard", price: "$52", tagged: 3, tone: "affiliate", href: "/arjunbuilds" },
  { handle: "rhearooms", photo: "shelf", avatar: "rhea", product: "Wall shelf", price: "$62", tagged: 5, tone: "own", href: "/rhearooms" },
  { handle: "niaglow", photo: "skincare", avatar: "nia", product: "Gua sha", price: "₹649", tagged: 3, tone: "affiliate", href: "/niaglow" },
];

// The fan: each card's resting transform + its straighten-and-lift on hover
// (DESIGN §Layout, the Straighten-On-Hover rule). Desktop only — on phones the
// deck is a flat snap rail. Static strings so the JIT sees every utility.
const FAN = [
  { rest: "md:[transform:translate(calc(-50%_-_300px),54px)_rotate(-15deg)]", hover: "md:hover:[transform:translate(calc(-50%_-_300px),28px)_rotate(-15deg)]", z: "md:z-10" },
  { rest: "md:[transform:translate(calc(-50%_-_152px),14px)_rotate(-7.5deg)]", hover: "md:hover:[transform:translate(calc(-50%_-_152px),-12px)_rotate(-7.5deg)]", z: "md:z-20" },
  { rest: "md:[transform:translate(-50%,0)_rotate(0deg)]", hover: "md:hover:[transform:translate(-50%,-26px)_rotate(0deg)]", z: "md:z-30" },
  { rest: "md:[transform:translate(calc(-50%_+_152px),14px)_rotate(7.5deg)]", hover: "md:hover:[transform:translate(calc(-50%_+_152px),-12px)_rotate(7.5deg)]", z: "md:z-20" },
  { rest: "md:[transform:translate(calc(-50%_+_300px),54px)_rotate(15deg)]", hover: "md:hover:[transform:translate(calc(-50%_+_300px),28px)_rotate(15deg)]", z: "md:z-10" },
] as const;

const NAV = [
  { label: "Explore", href: "/explore" },
  { label: "How it works", href: "#how" },
  { label: "For creators", href: "/signin" },
  { label: "For business", href: "/collabs" },
] as const;

const eyebrow = "font-sans text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground";

export function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-5 py-5 lg:px-10">
        <Link href="/" aria-label="Plugfolio home" className="flex items-center">
          <Logo layout="horizontal" tone="auto" />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href as Route}
              className="text-muted-foreground hover:text-foreground text-[13px] font-semibold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/signin">Log in</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/explore">Explore creators</Link>
          </Button>
        </div>
      </header>

      <main id="main">
        {/* ── Section 1 — the deck hero ── */}
        <section className="px-5 pt-6 lg:px-10">
          <div className="mx-auto max-w-[1200px] text-center">
            <span className="bg-active text-brand-violet-deep inline-flex items-center gap-2 rounded-pill px-4 py-2 text-[13px] font-semibold">
              <span className="bg-primary size-[7px] rounded-pill" aria-hidden />
              No account needed to shop
            </span>
            <h1 className="font-display mt-5 text-[clamp(2.25rem,6.2vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-balance">
              One link.
              <br />
              The whole deck.
            </h1>
            <p className="text-muted-foreground mx-auto mt-5 max-w-[48ch] text-[1.0625rem] leading-relaxed">
              Every post a creator makes is a card you can buy from. Tap one and land at the
              retailer — no account, no cart, no checkout.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button variant="primary" size="lg" asChild>
                <Link href="/explore">Explore creators</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="#how">See how it works</Link>
              </Button>
            </div>
          </div>

          {/* The fan of shoppable posts — absolute overlap on desktop, snap rail on phones. */}
          <ul
            aria-label="Shoppable posts from creators"
            className="relative mx-auto mt-8 flex max-w-[1200px] snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] md:mt-[clamp(30px,4vw,50px)] md:block md:h-[clamp(340px,38vw,430px)] md:snap-none md:overflow-visible md:pb-0"
          >
            {DECK.map((card, i) => (
              <li key={`${card.handle}-${card.photo}`} className="contents">
                <Link
                  href={card.href as Route}
                  className={`bg-card shadow-rest block flex-none snap-center rounded-card p-[9px] no-underline transition-transform duration-300 ease-out w-[200px] md:absolute md:left-1/2 md:top-0 md:w-[clamp(196px,20vw,238px)] md:hover:z-40 md:hover:shadow-lift ${FAN[i]!.rest} ${FAN[i]!.hover} ${FAN[i]!.z}`}
                >
                  <div className="bg-border rounded-image relative aspect-[5/6] overflow-hidden">
                    <Image
                      src={`/landing/posts/${card.photo}.jpg`}
                      alt={`A shoppable post by @${card.handle}.`}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                    <ProductTag
                      tone={card.tone}
                      name={card.product}
                      price={card.price}
                      className="absolute bottom-[10%] left-[7%]"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-[5px] pt-[11px] pb-[3px]">
                    <Image
                      src={`/landing/avatars/${card.avatar}.jpg`}
                      alt=""
                      width={22}
                      height={22}
                      className="rounded-pill object-cover"
                    />
                    <b className="text-[13px] font-semibold">@{card.handle}</b>
                    <em className="text-brand-violet-deep ml-auto text-xs font-bold not-italic">
                      {card.tagged} tagged
                    </em>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Section 2 — three taps ── */}
        <section id="how" aria-labelledby="how-h" className="px-5 pt-[clamp(56px,9vw,96px)] lg:px-10">
          <div className="mx-auto max-w-[1200px]">
            <div className="max-w-[46ch]">
              <h2 id="how-h" className="font-display text-[clamp(1.875rem,3.6vw,3rem)] font-bold leading-[1.08] tracking-[-0.035em] text-balance">
                Three taps from a post to the shop.
              </h2>
              <p className="text-muted-foreground mt-3 text-[1.0625rem] leading-relaxed">
                Nothing in between asks who you are.
              </p>
            </div>

            <ol className="mt-[clamp(34px,4vw,52px)] grid gap-[34px] md:grid-cols-3 md:gap-7">
              <TrailStep n={1} tone="sky" tilt="[transform:rotate(-1.6deg)]" title="Find a creator" copy="Search a name, or arrive straight from their bio link. Nothing asks you to sign in.">
                <div className="bg-card text-foreground rounded-pill flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-semibold">
                  <span className="opacity-50" aria-hidden>⌕</span>@mayamoves
                  <span className="bg-primary ml-0.5 h-3.5 w-0.5" aria-hidden />
                </div>
                <MockCreator avatar="maya" handle="mayamoves" meta="4 posts · 12 products" />
                <MockCreator avatar="nia" handle="niaglow" meta="6 posts · 21 products" dim />
              </TrailStep>

              <TrailStep n={2} tone="butter" tilt="[transform:rotate(1.8deg)] md:mt-7" title="Tap any post" copy="Every product in the frame already carries a tag — its name, its price, its retailer.">
                <div className="bg-border rounded-image relative aspect-[16/11] overflow-hidden">
                  <Image src="/landing/posts/gym.jpg" alt="A creator's post with a product tagged on it." fill sizes="360px" className="object-cover" />
                  <ProductTag tone="affiliate" name="Runners" price="₹6,499" className="absolute bottom-[12%] left-[8%]" />
                </div>
              </TrailStep>

              <TrailStep n={3} tone="mint" tilt="[transform:rotate(-1.2deg)] md:mt-14" title="Buy at the retailer" copy="One tap opens the store you already shop with. Plugfolio runs no cart and no checkout.">
                <div className="bg-card rounded-image grid gap-1.5 p-4">
                  <span className={eyebrow}>Handing you over</span>
                  <b className="font-display text-[1.375rem] tracking-[-0.02em]">amazon.in</b>
                  <span className="bg-foreground text-background rounded-pill mt-1 inline-flex w-fit px-3.5 py-1.5 text-[13px] font-bold">
                    Opening…
                  </span>
                  <span className="text-muted-foreground text-xs">We never see your card</span>
                </div>
              </TrailStep>
            </ol>

            <div className="mt-[clamp(28px,4vw,40px)] flex flex-wrap items-center gap-3.5">
              <Button variant="primary" asChild>
                <Link href="/explore">Start exploring</Link>
              </Button>
              <span className={eyebrow}>No cart · no checkout · no wallet</span>
            </div>
          </div>
        </section>

        {/* ── Section 3 — pick your side ── */}
        <section aria-labelledby="doors-h" className="px-5 pt-[clamp(56px,9vw,96px)] pb-[clamp(56px,9vw,96px)] lg:px-10">
          <div className="mx-auto max-w-[1200px]">
            <h2 id="doors-h" className="font-display text-[clamp(1.875rem,3.6vw,3rem)] font-bold leading-[1.08] tracking-[-0.035em]">
              Pick your side.
            </h2>
            <div className="mt-[clamp(30px,4vw,46px)] grid gap-4 md:grid-cols-2">
              <DoorCard
                href="/explore"
                micro="You came to buy"
                title="Shop"
                copy="Find the creators you already follow and buy what they post, at the retailer."
                go="Explore creators"
                wide
                list={["No account, ever", "Coupon codes, one tap to copy", "Follow only if you want to", "Every tap opens the real retailer"]}
              />
              <DoorCard href="/signin" micro="You make the posts" title="Create" copy="Up to five shoppable pages, every tap measured per post." go="Set up your page" />
              <DoorCard href="/collabs" micro="You run a brand" title="Brands" copy="Post a brief, or approach a creator from their page." go="Find creators" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border border-t px-5 py-8 lg:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
          <Link href="/" aria-label="Plugfolio home" className="flex items-center">
            <Logo layout="horizontal" tone="auto" />
          </Link>
          <div className="flex flex-wrap items-center gap-5">
            {[
              { label: "Explore", href: "/explore" },
              { label: "For creators", href: "/signin" },
              { label: "For business", href: "/collabs" },
              { label: "Support", href: "/support" },
            ].map((item) => (
              <Link key={item.label} href={item.href as Route} className="text-muted-foreground hover:text-foreground text-[13px] font-semibold">
                {item.label}
              </Link>
            ))}
            <span className={eyebrow}>One link, everything shoppable · 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrailStep({
  n,
  tone,
  tilt,
  title,
  copy,
  children,
}: {
  n: number;
  tone: "sky" | "butter" | "mint";
  /** Resting rotation (+ any desktop stagger); straightens on hover. */
  tilt: string;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <li className="group list-none">
      <Tile
        tone={tone}
        className={`shadow-rest min-h-[186px] rounded-card p-3 transition-transform duration-300 ease-out group-hover:[transform:rotate(0deg)] ${tilt}`}
      >
        {children}
      </Tile>
      <span className="bg-foreground text-background mt-5 mb-3 inline-grid size-[34px] place-items-center rounded-pill text-[13px] font-bold">
        {n}
      </span>
      <h3 className="font-display mb-2 text-[1.375rem] font-bold tracking-[-0.02em]">{title}</h3>
      <p className="text-muted-foreground text-[0.9375rem] leading-[1.55]">{copy}</p>
    </li>
  );
}

function MockCreator({
  avatar,
  handle,
  meta,
  dim,
}: {
  avatar: string;
  handle: string;
  meta: string;
  dim?: boolean;
}) {
  return (
    <div className={`bg-card rounded-image mt-2 flex items-center gap-2.5 p-2.5 ${dim ? "opacity-60" : ""}`}>
      <Image src={`/landing/avatars/${avatar}.jpg`} alt="" width={26} height={26} className="rounded-pill object-cover" />
      <span>
        <b className="text-foreground block text-[13px] font-semibold">@{handle}</b>
        <i className="text-muted-foreground block text-xs not-italic">{meta}</i>
      </span>
    </div>
  );
}

function DoorCard({
  href,
  micro,
  title,
  copy,
  go,
  list,
  wide,
}: {
  href: string;
  micro: string;
  title: string;
  copy: string;
  go: string;
  list?: readonly string[];
  wide?: boolean;
}) {
  return (
    <Link
      href={href as Route}
      className={`bg-card border-border shadow-rest hover:shadow-lift group/db flex flex-col rounded-card border p-7 no-underline transition-shadow duration-200 ${wide ? "md:row-span-2" : ""}`}
    >
      <span className="text-muted-foreground flex items-center gap-2 text-[0.9375rem]">
        <span className="bg-primary size-[5px] rounded-pill" aria-hidden />
        {micro}
      </span>
      <h3 className="font-display mt-3.5 mb-2.5 text-[clamp(1.875rem,3.6vw,3rem)] font-extrabold leading-none tracking-[-0.035em]">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-[44ch] text-[0.9375rem] leading-[1.55]">{copy}</p>
      {list ? (
        <ul className="border-border mt-[22px] border-t">
          {list.map((item) => (
            <li key={item} className="border-border text-muted-foreground border-b py-2.5 text-[0.9375rem]">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      <span className="text-foreground mt-auto flex items-center justify-between pt-6 text-[13px] font-bold">
        {go}
        <span aria-hidden className="transition-transform duration-200 group-hover/db:translate-x-1.5">→</span>
      </span>
    </Link>
  );
}
