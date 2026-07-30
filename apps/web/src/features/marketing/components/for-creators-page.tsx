import { Button, HandleClaim, ProofRow } from "@plugfolio/ui";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Fact,
  MarketingDoors,
  PostCard,
  SplitBand,
  Step,
  mk,
} from "./marketing-shared";

/**
 * /for-creators (DESIGN for-creators.html) — written for someone who does NOT
 * have an account yet, so every door ends at /join?as=creator. Shows the page
 * they'd get rather than describing it; states the caps and the money rule up
 * front (Plugfolio never handles your money).
 */
export function ForCreatorsPage() {
  return (
    <>
      <main className={mk.main}>
        {/* ── hero (split: argument left, artefact right) ── */}
        <section className="items-center gap-[clamp(24px,4vw,44px)] pt-[clamp(28px,5vw,56px)] lg:grid lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className={mk.eyebrow}>For creators</p>
            <h1 className={mk.h1}>Turn your content into commerce.</h1>
            <p className={mk.lede}>
              Tag the products in what you already post, pin your own affiliate or store links, and
              find out which post actually drove the taps.
            </p>
            <div className={mk.cta}>
              <Button asChild>
                <Link href={"/join?as=creator" as Route}>Create your page</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/explore">See a real one first</Link>
              </Button>
            </div>
            <p className={`mt-[18px] ${mk.eyebrow}`}>Free to start · no card needed</p>
          </div>
          <div className="mt-8 lg:mt-0">
            <PostCard
              tone="butter"
              photo="skincare"
              alt="A creator's post with two products tagged on it"
              tags={[
                { name: "Serum", price: "₹1,299", tone: "offer", pos: "left-[8%] top-[24%]" },
                { name: "Balm", price: "₹640", pos: "left-[36%] top-[62%]" },
              ]}
              footer={{ avatar: "maya", count: "2 things" }}
            />
          </div>
        </section>

        {/* ── three steps ── */}
        <section className={mk.band}>
          <h2 className={mk.h2}>Three steps, then it&apos;s live.</h2>
          <p className={mk.copy}>
            There&apos;s no store to build and no theme to pick. You&apos;re tagging content
            you&apos;ve already made.
          </p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            <Step n={1} title="Add the post">
              Paste the image link and a caption. Your page is live from the first one.
            </Step>
            <Step n={2} title="Paste the product's URL">
              We pull the title, image and price. Then you pin your own affiliate link — or your own
              store&apos;s — over the top.
            </Step>
            <Step n={3} title="Share the one link">
              It goes in your bio. Every post behind it is shoppable, and nobody needs an account to
              buy.
            </Step>
          </ol>
        </section>

        {/* ── claim your handle ── */}
        <SplitBand
          title="Claim your handle before someone else does."
          lead={
            <>
              <p className={mk.copy}>
                You can only claim a name you can prove you own, by connecting the social it belongs
                to. That&apos;s what stops anyone squatting yours.
              </p>
              <p className={mk.copy}>
                Your page works immediately with a temporary name, so nothing waits on this.
              </p>
            </>
          }
        >
          <HandleClaim
            handle="yourhandle"
            action={
              <Button asChild>
                <Link href={"/join?as=creator" as Route}>Claim it</Link>
              </Button>
            }
          />
        </SplitBand>

        {/* ── attribution proof ── */}
        <SplitBand
          title={'Point at one post and say "that one worked".'}
          lead={
            <>
              <p className={mk.copy}>
                Every outbound tap is counted against the post and the product it came from. Nothing
                is estimated, inferred or modelled.
              </p>
              <p className={mk.copy}>
                Where something genuinely can&apos;t be measured — someone using an in-store code at
                a till — it says so rather than guessing. You should be able to trust the numbers you
                act on.
              </p>
            </>
          }
        >
          <ProofRow
            flag="Tracked"
            figure="128"
            caption="taps from this post"
            thumb={
              <Image
                src="/landing/posts/gym.jpg"
                alt=""
                width={200}
                height={200}
                sizes="64px"
                className="size-full object-cover"
              />
            }
          />
        </SplitBand>

        {/* ── caps ── */}
        <section className={mk.band}>
          <h2 className={mk.h2}>Room for more than one you.</h2>
          <p className={mk.copy}>
            Caps are stated as facts, not as a plan you upgrade out of. If you&apos;re planning to
            run ten brands, better to know now.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Fact title="Up to 5 profiles on one account">
              Separate pages for separate audiences, all under one login and one password.
            </Fact>
            <Fact title="Up to 3 managers per profile">
              Hand tagging to someone else without handing over your account.
            </Fact>
          </div>
        </section>

        {/* ── the money rule ── */}
        <section className={mk.band}>
          <div className="bg-active rounded-tile p-[clamp(22px,3vw,28px)]">
            <b className="font-display text-brand-violet-deep block text-xl font-bold tracking-[-0.02em]">
              Plugfolio never handles your money.
            </b>
            <p className="text-muted-foreground mt-2 max-w-[56ch] text-[0.9375rem] leading-[1.55]">
              No payouts to wait for, no balance to withdraw, no cut taken from your deal. Buyers go
              to the retailer on your own link, and you get paid the way you already do. We&apos;re
              the shop window, not the till.
            </p>
          </div>
        </section>

        <MarketingDoors
          current="/for-creators"
          primary={{ label: "Create your page", href: "/join?as=creator" }}
          ghost={{ label: "Explore creators", href: "/explore" }}
        />
      </main>
    </>
  );
}
