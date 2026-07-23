import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { LandingCta } from "./landing-cta";
import { CreatorMock } from "./creator-mock";

/**
 * Landing (`/`) — a faithful build of the design-out landing: nav, a two-column
 * hero (copy + creator-page mock), "how shopping works", a creators/business
 * band, and the ink footer. Shopper-first, no sign-in wall (§2.2). All color
 * runs through tokens (violet = primary, lime = accent); no inline styles.
 */
const INNER = "mx-auto w-full max-w-[1180px] px-5 lg:px-11";

const STEPS = [
  {
    n: "01",
    title: "Find a creator",
    body: "Search a name or browse by vibe — beauty, fitness, home, tech.",
  },
  {
    n: "02",
    title: "Tap any post",
    body: "Every shoppable post shows exactly the gear that’s in it.",
  },
  {
    n: "03",
    title: "Buy at the retailer",
    body: "One tap opens the store. We never see your card — you just check out where you already trust.",
  },
];

export function LandingPage() {
  return (
    <main className="bg-background text-foreground min-h-dvh">
      {/* ── nav ── */}
      <nav className="border-border border-b">
        <div className={`${INNER} flex items-center justify-between py-5`}>
          <Link href="/" aria-label="Plugfolio home">
            <Logo layout="horizontal" tone="auto" />
          </Link>
          <div className="flex items-center gap-3 lg:gap-[22px]">
            <Link
              href="/explore"
              className="text-muted-foreground hover:text-foreground hidden text-sm font-medium lg:inline"
            >
              Explore
            </Link>
            <Link
              href="/signin"
              className="text-muted-foreground hover:text-foreground hidden text-sm font-medium lg:inline"
            >
              For creators
            </Link>
            <Link href="/signin" className="text-foreground text-sm font-semibold">
              Log in
            </Link>
            <LandingCta href="/explore" size="sm">
              Explore creators
            </LandingCta>
          </div>
        </div>
      </nav>

      {/* ── hero ── */}
      <section className="from-muted to-background bg-gradient-to-b">
        <div
          className={`${INNER} grid items-center gap-12 pb-16 pt-11 lg:grid-cols-2 lg:gap-14 lg:pb-14 lg:pt-16`}
        >
          <div>
            <p className="text-primary mb-[18px] font-mono text-xs uppercase tracking-[0.16em]">
              Shop from creators you follow
            </p>
            <h1 className="font-display text-[clamp(2.25rem,9vw,3.125rem)] font-extrabold leading-[0.96] tracking-[-0.04em] lg:text-[clamp(2.875rem,4.6vw,4.125rem)]">
              Buy what your
              <br />
              favorites post.
            </h1>
            <p className="text-muted-foreground mt-5 max-w-[460px] text-base leading-[1.6] lg:text-[18px]">
              Follow a creator, tap any post, and buy it straight at the retailer. No account. No
              checkout. No friction.
            </p>

            {/* honesty pill — a sanctioned lime moment (fill + dark text) */}
            <div className="bg-accent text-accent-foreground rounded-pill mt-5 inline-flex items-center gap-2 px-[15px] py-[7px] font-mono text-[11px] font-bold uppercase tracking-[0.04em]">
              <span aria-hidden className="bg-accent-foreground size-1.5 rounded-full" />
              No login to shop
            </div>

            <div className="mt-6 flex gap-3 lg:mt-8">
              <LandingCta
                href="/explore"
                tone="solid"
                className="flex-1 px-4 text-sm lg:flex-none lg:px-[26px] lg:text-[15px]"
              >
                Explore creators →
              </LandingCta>
              <LandingCta
                href="/explore"
                tone="outline"
                className="flex-1 px-4 text-sm lg:flex-none lg:px-[26px] lg:text-[15px]"
              >
                Browse products
              </LandingCta>
            </div>

            <div className="mt-8 flex items-center gap-2.5">
              <div className="flex">
                {[
                  "/images/avatar-sample/avatar-00001.jpg",
                  "/images/avatar-sample/avatar-00002.jpg",
                  "/images/avatar-sample/avatar-00003.jpg",
                ].map((src, i) => (
                  <span
                    key={src}
                    aria-hidden
                    className={`border-background relative size-8 overflow-hidden rounded-full border-2 ${i > 0 ? "-ml-2.5" : ""}`}
                  >
                    <Image src={src} alt="" fill sizes="32px" className="object-cover" />
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground text-[13px]">
                Thousands buying straight from posts they love —{" "}
                <span className="text-foreground font-semibold">no sign-up</span>.
              </p>
            </div>
          </div>

          <CreatorMock />
        </div>
      </section>

      {/* ── how shopping works ── */}
      <section className="bg-muted border-border border-t">
        <div className={`${INNER} pb-[52px] pt-10 lg:pt-14`}>
          <p className="text-primary mb-3 font-mono text-xs uppercase tracking-[0.16em]">
            How shopping works
          </p>
          <h2 className="font-display max-w-[600px] text-[25px] font-bold leading-[1.04] tracking-[-0.03em] lg:text-[clamp(1.75rem,3vw,2.25rem)]">
            Three taps from a post to your cart — and never a login.
          </h2>
          <div className="mt-9 grid gap-3 lg:grid-cols-3 lg:gap-4">
            {STEPS.map((step) => (
              <div key={step.n} className="border-border bg-card rounded-2xl border p-6">
                <div className="text-primary font-mono text-xs font-bold">{step.n}</div>
                <div className="font-display mt-3 text-[18px] font-bold">{step.title}</div>
                <p className="text-muted-foreground mt-2 text-sm leading-[1.55]">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <LandingCta href="/explore" tone="solid">
              Start exploring →
            </LandingCta>
            <span className="text-muted-foreground font-mono text-xs">
              Follow creators to catch every drop.
            </span>
          </div>
        </div>
      </section>

      {/* ── creators + business band ── */}
      <section className={`${INNER} py-14`}>
        <div className="border-border flex flex-col overflow-hidden rounded-[20px] border lg:flex-row">
          <Link
            href="/signin"
            className="bg-muted hover:bg-muted/70 flex flex-1 flex-col gap-1.5 p-7 transition-colors"
          >
            <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.14em]">
              Are you a creator?
            </span>
            <span className="font-display text-[20px] font-bold">Turn your posts into a shop.</span>
            <span className="text-muted-foreground max-w-[420px] text-sm leading-[1.55]">
              Tag once, earn on every tap. Set up in five minutes — keep the audience you already
              have.
            </span>
            <span className="text-primary mt-2 text-sm font-semibold">
              See how it works for creators →
            </span>
          </Link>
          <Link
            href="/collabs"
            className="border-border hover:bg-muted/40 flex flex-col justify-center gap-1.5 border-t p-7 transition-colors lg:border-l lg:border-t-0"
          >
            <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.14em]">
              Run a brand?
            </span>
            <span className="text-muted-foreground max-w-[220px] text-sm leading-[1.5]">
              Find creators to collaborate with.
            </span>
            <span className="text-muted-foreground mt-1 text-sm font-semibold">For business →</span>
          </Link>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="bg-brand-ink">
        <div
          className={`${INNER} flex flex-wrap items-center justify-between gap-4 py-[34px] text-white`}
        >
          <Link href="/" aria-label="Plugfolio home">
            <Logo layout="reversed" />
          </Link>
          <span className="font-mono text-[11px] text-white/55">
            One link, everything shoppable · 2026
          </span>
        </div>
      </footer>
    </main>
  );
}
