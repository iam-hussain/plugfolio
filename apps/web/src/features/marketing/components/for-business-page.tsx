import { Button, CollabBubble, CollabThread, Exclusions } from "@plugfolio/ui";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fact, MarketingDoors, SplitBand, mk } from "./marketing-shared";

/**
 * /for-business (DESIGN for-business.html) — a pitch, not the product. Strangers
 * shouldn't land in the logged-out /collabs screen, so every door ends at
 * /join?as=business. States the money rule and the deliberate exclusions up
 * front: Plugfolio handles no money and takes no cut.
 */
export function ForBusinessPage() {
  return (
    <>
      <main className={mk.main}>
        {/* ── hero ── */}
        <section className="pt-[clamp(28px,5vw,56px)]">
          <p className={mk.eyebrow}>For business</p>
          <h1 className={mk.h1}>Find creators to work with.</h1>
          <p className={mk.lede}>
            Describe what you need and hear from creators who want it, or approach one directly from
            their page. The whole negotiation lives in a single thread.
          </p>
          <div className={mk.cta}>
            <Button asChild>
              <Link href={"/join?as=business" as Route}>Post your first brief</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/explore">Browse creators first</Link>
            </Button>
          </div>
        </section>

        {/* ── two ways in ── */}
        <section className={mk.band}>
          <h2 className={mk.h2}>Two ways in.</h2>
          <p className={mk.copy}>
            Pick whichever suits the campaign. Most brands end up using both.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                micro: "Door one",
                title: "Post a brief",
                copy: "Write what you need on the open board and let creators come to you. Good when you don't have a shortlist yet.",
                go: "Creators reply to you →",
              },
              {
                micro: "Door two",
                title: "Approach a creator",
                copy: "Found someone already? Request a collab straight from their page. Good when you know exactly who you want.",
                go: "Starts the same thread →",
              },
            ].map((door) => (
              <div
                key={door.title}
                className="border-border bg-card shadow-rest rounded-card flex flex-col border p-6"
              >
                <p className={mk.eyebrow}>{door.micro}</p>
                <b className="font-display mt-2 mb-2 block text-xl font-bold tracking-[-0.02em]">
                  {door.title}
                </b>
                <p className="text-muted-foreground text-copy leading-[1.55]">{door.copy}</p>
                <span className="text-muted-foreground mt-auto pt-5 text-label font-bold">
                  {door.go}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── the brief ── */}
        <SplitBand
          title="What a brief actually says."
          lead={
            <>
              <p className={mk.copy}>
                Short is fine. You&apos;re describing the work, not writing a spec — creators reply
                with questions and the rest gets settled in the thread.
              </p>
              <p className={mk.copy}>
                Budget is a free text field, deliberately. You work in whichever currency you
                already work in, and nothing forces a format on you.
              </p>
            </>
          }
        >
          <div className="bg-card shadow-rest rounded-paper max-w-[460px] rotate-[-1.2deg] p-6">
            <p className={mk.eyebrow}>Open brief</p>
            <b className="font-display mt-2 mb-2 block text-xl font-bold tracking-[-0.02em]">
              Skincare creators for a spring launch
            </b>
            <p className="text-muted-foreground text-copy leading-[1.55]">
              Two posts, one story. Budget discussed in the thread.
            </p>
            <div className="border-border mt-4 flex items-center border-t pt-3.5">
              <div className="flex">
                {["maya", "nia", "rhea"].map((avatar) => (
                  <Image
                    key={avatar}
                    src={`/landing/avatars/${avatar}.jpg`}
                    alt=""
                    width={60}
                    height={60}
                    className="ring-card -mr-3 size-[26px] rounded-pill object-cover ring-2"
                  />
                ))}
              </div>
              <span className="text-muted-foreground ml-4 text-copy">creators replying</span>
            </div>
          </div>
        </SplitBand>

        {/* ── one thread ── */}
        <SplitBand
          title="One thread, start to agreed."
          lead={
            <p className={mk.copy}>
              Terms, revisions and the yes all happen in the same place, so there&apos;s no hunting
              through email to find what was actually agreed.
            </p>
          }
        >
          <CollabThread>
            <CollabBubble>Two posts and a story — is that within range?</CollabBubble>
            <CollabBubble from="you">It is. Can you cover the launch week?</CollabBubble>
            <CollabBubble>Yes. Sending dates now.</CollabBubble>
            <CollabBubble from="deal">Terms agreed</CollabBubble>
          </CollabThread>
        </SplitBand>

        {/* ── up front ── */}
        <section className={mk.band}>
          <h2 className={mk.h2}>Said out loud, up front.</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Fact title="Payment settles off-platform">
              Plugfolio handles no money and takes no cut of your deal. You pay the creator the way
              you&apos;d pay any supplier.
            </Fact>
            <Fact title="Attribution is measured, not modelled">
              Tap counts on a creator&apos;s posts are directly recorded. Nothing is estimated, so
              what you see is what happened.
            </Fact>
          </div>

          <Exclusions title="What Plugfolio deliberately isn't">
            <li>No media kits or campaign suites — briefs and threads, nothing heavier.</li>
            <li>No on-platform payments, escrow or invoicing.</li>
            <li>No creator-to-creator collabs.</li>
            <li>If your team needs those, better to find out here than after signing up.</li>
          </Exclusions>
        </section>

        <MarketingDoors
          current="/for-business"
          primary={{ label: "Create your business", href: "/join?as=business" }}
          ghost={{ label: "Browse creators", href: "/explore" }}
        />
      </main>
    </>
  );
}
