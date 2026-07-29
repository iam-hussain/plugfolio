import { Button } from "@plugfolio/ui";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fact, MarketingDoors, PostCard, SplitBand, mk } from "./marketing-shared";

/**
 * /how-it-works (DESIGN how-it-works.html) — shopper-facing. Shows the loop
 * with the real component rather than describing it, and names what it can't
 * measure. The pinned price tag is the actual control a shopper taps.
 */
const LOOP: readonly { n: number; title: string; copy: string }[] = [
  {
    n: 1,
    title: "A creator tags their post",
    copy: "They paste the product's link and pin it to the photo, at the spot the thing actually is.",
  },
  {
    n: 2,
    title: "You tap the tag",
    copy: "The price and the shop it opens are both on the tag before you tap, so nothing is a surprise.",
  },
  {
    n: 3,
    title: "You buy there, not here",
    copy: "Plugfolio's job ends at the handoff. You're a normal customer of a normal shop.",
  },
];

const TRACK: readonly { label: string; tracked: boolean }[] = [
  { label: "You tapped out to a shop", tracked: true },
  { label: "You copied a discount code", tracked: true },
  { label: "Whether you actually bought anything", tracked: false },
  { label: "An in-store code you used at a till", tracked: false },
];

const FAQ: readonly { q: string; a: string }[] = [
  {
    q: "Do I need an account to buy something?",
    a: "No. Shopping never needs an account on Plugfolio — that's a rule, not a default you can lose. An account only exists so you can follow creators and leave comments as yourself.",
  },
  {
    q: "Does it cost more than buying direct?",
    a: "No. You land on the retailer's normal page at their normal price. If the creator has a discount code, you get it cheaper.",
  },
  {
    q: "Does the creator earn from this?",
    a: "Usually yes — most links are affiliate links, and some products are the creator's own. Products a creator sells themselves are marked, so you always know which is which.",
  },
  {
    q: "Where do returns and delivery go?",
    a: "To the retailer you bought from. Plugfolio isn't part of the sale, so it can't help with an order — the shop's own support can.",
  },
  {
    q: "What happens to my data?",
    a: "Taps are counted so creators know which post worked. If you never make an account, there's no name attached to it.",
  },
];

function LoopCaption({ n, title, copy }: { n: number; title: string; copy: string }) {
  return (
    <div className="mt-3.5 flex items-start gap-2.5 px-1">
      <span className="bg-foreground text-background grid size-[26px] shrink-0 place-items-center rounded-pill font-mono text-[11px] font-bold">
        {n}
      </span>
      <span>
        <b className="font-display block text-[0.9375rem] font-bold tracking-[-0.01em]">{title}</b>
        <p className="text-muted-foreground mt-1 text-[0.9375rem] leading-[1.5]">{copy}</p>
      </span>
    </div>
  );
}

export function HowItWorksPage() {
  return (
    <>
      <main className={mk.main}>
        {/* ── hero ── */}
        <section className="pt-[clamp(28px,5vw,56px)]">
          <p className={mk.eyebrow}>How it works</p>
          <h1 className={mk.h1}>Buy what your favourites post.</h1>
          <p className={mk.lede}>
            A creator tags what&apos;s in their post. You tap the tag. You land on the shop that
            sells it. That&apos;s the whole thing — and none of it asks you to sign up.
          </p>
          <div className={mk.cta}>
            <Button asChild>
              <Link href="/explore">Start exploring</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={"/for-creators" as Route}>I make content</Link>
            </Button>
          </div>
        </section>

        {/* ── the loop ── */}
        <section className={mk.band}>
          <h2 className={mk.h2}>Three taps, start to finish.</h2>
          <p className={mk.copy}>
            Nothing below is a mock-up of a feature. The pinned price tag is the actual control
            you&apos;ll tap.
          </p>
          <div className="mt-[clamp(24px,4vw,40px)] grid gap-6 md:grid-cols-3">
            <div>
              <PostCard
                tone="lavender"
                photo="skincare"
                alt="A creator's post with two products tagged on it"
                square
                wrap="rotate-[-1.6deg]"
                tags={[
                  { name: "Serum", price: "₹1,299", tone: "offer", pos: "left-[9%] top-[26%]" },
                  { name: "Balm", price: "₹640", pos: "left-[40%] top-[62%]" },
                ]}
              />
              <LoopCaption {...LOOP[0]!} />
            </div>
            <div>
              <PostCard
                tone="sky"
                photo="skincare"
                alt="The tagged product, shown large"
                square
                wrap="rotate-[1.4deg]"
                tags={[{ name: "Serum", price: "₹1,299", tone: "offer", pos: "left-[12%] top-[58%]" }]}
              />
              <LoopCaption {...LOOP[1]!} />
            </div>
            <div>
              {/* The retailer step is deliberately NOT a Plugfolio surface — a
                  dashed frame is the only cue that this shop isn't ours. */}
              <div className="border-border rounded-image overflow-hidden border border-dashed">
                <Image
                  src="/landing/posts/skincare.jpg"
                  alt="The product on the retailer's own site"
                  width={900}
                  height={675}
                  sizes="360px"
                  className="block aspect-[4/3] w-full object-cover"
                />
                <div className="flex items-center gap-2.5 px-4 py-3.5">
                  <span className="text-[0.9375rem]">
                    <b className="font-bold">The retailer</b>
                    <br />
                    <span className="text-muted-foreground text-xs">their site · their checkout</span>
                  </span>
                  <span className="border-border text-muted-foreground ml-auto rounded-pill border px-3.5 py-1.5 text-[11px] font-bold whitespace-nowrap">
                    Add to basket
                  </span>
                </div>
              </div>
              <LoopCaption {...LOOP[2]!} />
            </div>
          </div>
        </section>

        {/* ── what we don't ask ── */}
        <section className={mk.band}>
          <h2 className={mk.h2}>What we don&apos;t ask you for.</h2>
          <p className={mk.copy}>
            These aren&apos;t settings or a plan tier. They&apos;re rules the product is built
            around.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Fact title="No account, ever, to buy">
              No wall, no modal, no &quot;sign up to continue&quot; between you and the shop. An
              account exists only if you want to follow a creator or leave a comment.
            </Fact>
            <Fact title="No cart and no checkout">
              Plugfolio doesn&apos;t sell you anything. There&apos;s nothing to add up, so
              there&apos;s no total and no basket.
            </Fact>
            <Fact title="We never see your card">
              Payment happens on the retailer&apos;s site, under their terms. Your card details never
              touch us because we&apos;re never in that step.
            </Fact>
            <Fact title="Nothing is estimated">
              Every number a creator sees is directly measured. Where something can&apos;t be
              measured, we say so instead of guessing.
            </Fact>
          </div>
        </section>

        {/* ── what we can & can't see ── */}
        <SplitBand
          title="What we can and can't see."
          lead={
            <>
              <p className={mk.copy}>
                A creator earns from these links, so it&apos;s fair to know what gets counted. This
                is the full list.
              </p>
              <p className={mk.copy}>
                The last two are the honest part. We could guess at them; other tools do. We&apos;d
                rather a creator trust the numbers we do show.
              </p>
            </>
          }
        >
          <div className="border-border bg-card shadow-rest rounded-card w-full overflow-hidden border">
            {TRACK.map((row, index) => (
              <div
                key={row.label}
                className={`flex items-center justify-between gap-4 px-5 py-4 text-[0.9375rem] ${index > 0 ? "border-border border-t" : ""}`}
              >
                <span>{row.label}</span>
                <span
                  className={`rounded-pill px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.04em] uppercase ${
                    row.tracked
                      ? "bg-active text-brand-violet-deep"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {row.tracked ? "Tracked" : "Not tracked"}
                </span>
              </div>
            ))}
          </div>
        </SplitBand>

        {/* ── FAQ ── */}
        <section className={mk.band}>
          <h2 className={mk.h2}>Questions people actually ask.</h2>
          <div className="border-border mt-[clamp(20px,3vw,30px)] border-t">
            {FAQ.map((item, index) => (
              <details
                key={item.q}
                open={index === 0}
                className="border-border group/faq border-b"
              >
                <summary className="font-display flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-[18px] text-[1.0625rem] font-bold tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden
                    className="text-muted-foreground text-2xl leading-none group-open/faq:hidden"
                  >
                    +
                  </span>
                  <span
                    aria-hidden
                    className="text-muted-foreground hidden text-2xl leading-none group-open/faq:inline"
                  >
                    –
                  </span>
                </summary>
                <p className="text-muted-foreground mb-5 max-w-[62ch] text-[0.9375rem] leading-[1.6]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <MarketingDoors
          current="/how-it-works"
          primary={{ label: "Create an account", href: "/join" }}
          ghost={{ label: "Or just start shopping", href: "/explore" }}
        />
      </main>
    </>
  );
}
