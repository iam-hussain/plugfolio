import { cva } from "class-variance-authority";
import type { Route } from "next";
import Link from "next/link";
import type {
  AccessibleProfile,
  ShopperPost,
  TrafficSummary,
  YouTubeConnectionView,
} from "@plugfolio/core";
import {
  Button,
  DashBody,
  DashCard,
  DashCardAction,
  DashCardHead,
  DashCardNote,
  DashCardTitle,
  EmptyState,
} from "@plugfolio/ui";
import { SocialConnections } from "@/features/account-auth";
import { connectGoogle } from "@/features/account-auth/connect-social-action";
import { TrafficSummaryView } from "@/features/traffic";
import { NewProfileButton } from "./new-profile-button";

/**
 * The creator's back-room home (DESIGN dashboard.html §5.18): the profile you
 * are editing, what needs doing, what the account is connected to, and the
 * traffic all of it earned.
 *
 * The route above it loads and nothing else (§5: `app/` is thin).
 */
export type DashboardHomeProps = {
  profiles: readonly AccessibleProfile[];
  active: AccessibleProfile | null;
  /** Whether the account has any social connection yet. */
  connected: boolean;
  youtube: YouTubeConnectionView | null;
  /** The active profile's all-time traffic; null when there's no active profile. */
  traffic: TrafficSummary | null;
  /** Posts on the active profile with nothing tagged — the highest-value nudge. */
  untaggedPosts: readonly ShopperPost[];
};

/** The quick-add cards; the lead verb (a post) keeps the accent edge. */
const addCard = cva(
  "bg-card rounded-tile block border p-[18px] transition-[transform,border-color] duration-150 hover:-translate-y-0.5",
  {
    variants: {
      lead: { true: "border-primary", false: "border-border hover:border-primary" },
    },
    defaultVariants: { lead: false },
  },
);

export function DashboardHome({
  profiles,
  active,
  connected,
  youtube,
  traffic,
  untaggedPosts,
}: DashboardHomeProps) {
  const untagged = untaggedPosts.length;

  return (
    <>
      <DashBody>
        {profiles.length === 0 ? (
          <EmptyState
            title="Create your first profile"
            action={connected ? <NewProfileButton /> : null}
          >
            {connected
              ? "Your account is connected — create a profile to get your shoppable page."
              : "Connect a Google or Meta account below, then create a profile to get your shoppable page."}
          </EmptyState>
        ) : (
          <>
            {/* v2 quick-add cards: the three verbs the back room exists for. */}
            {active ? (
              <div className="mt-3.5 grid gap-3 lg:grid-cols-3">
                {[
                  {
                    title: "Add a post",
                    note: "A still or a reel, then tag what is in it.",
                    href: { pathname: "/dashboard/posts/new", query: { profile: active.id } },
                    lead: true,
                  },
                  {
                    title: "Add a thing",
                    note: "Paste a product URL — image, title and price come with it.",
                    href: { pathname: "/dashboard/products/new", query: { profile: active.id } },
                    lead: false,
                  },
                  {
                    title: "Add a shelf",
                    note: "Group your posts and things. One shelf each, or none.",
                    href: { pathname: "/dashboard/categories", query: { profile: active.id } },
                    lead: false,
                  },
                ].map((card) => (
                  <Link key={card.title} href={card.href} className={addCard({ lead: card.lead })}>
                    <span className="font-display text-body block font-semibold tracking-[-0.02em]">
                      {card.title}
                    </span>
                    <span className="text-muted-foreground text-label mt-1.5 block leading-normal">
                      {card.note}
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}

            {/* The v2 "needs tagging" card — the single highest-value thing on
                this screen: an untagged post earns nothing. Only when it has
                something to say; an always-present nudge is wallpaper. */}
            {active && untagged > 0 ? (
              <div className="border-primary bg-card rounded-sheet mt-3.5 border p-[18px]">
                <p className="text-primary text-pico tracking-eyebrow font-mono font-bold uppercase">
                  Needs tagging
                </p>
                <p className="font-display text-title mt-2 font-bold tracking-[-0.035em]">
                  {untagged} {untagged === 1 ? "post earns" : "posts earn"} nothing yet
                </p>
                <p className="text-muted-foreground text-label mt-1.5 leading-[1.55]">
                  {untagged === 1
                    ? "It imported fine — it just has"
                    : "They imported fine — they just have"}{" "}
                  no things on {untagged === 1 ? "it" : "them"}.
                </p>
                <ul className="mt-3.5 flex gap-[9px] overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {untaggedPosts.slice(0, 8).map((post) => (
                    <li key={post.id} className="w-[104px] flex-none">
                      <Link
                        href={{
                          pathname: `/dashboard/posts/${post.id}`,
                          query: { profile: active.id },
                        }}
                        className="border-border rounded-panel hover:border-primary block overflow-hidden border transition-colors"
                      >
                        <span className="bg-active block h-[104px] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element -- ponytail: unoptimized until image domains are pinned */}
                          <img
                            src={post.mediaUrl}
                            alt=""
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        </span>
                        <span className="text-muted-foreground text-nano block h-11 overflow-hidden px-2 py-[7px] leading-[1.35]">
                          {post.caption ?? "Untitled post"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}

        {/* Wrapped so the stack rhythm holds: the card-to-card auto margin
            only fires between adjacent DashCards, and the block above this is
            a plain div. */}
        <div className="mt-3.5">
          <SocialConnections youtube={youtube} connectAction={connectGoogle} />
        </div>

        {active && traffic ? (
          <DashCard className="mt-3.5">
            <DashCardHead>
              <DashCardTitle>Traffic · @{active.username}</DashCardTitle>
              <DashCardNote>All time</DashCardNote>
              <DashCardAction>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/traffic?profile=${active.id}`}>Open Traffic</Link>
                </Button>
              </DashCardAction>
            </DashCardHead>
            <TrafficSummaryView summary={traffic} pageHref={`/${active.username}` as Route} />
          </DashCard>
        ) : null}
      </DashBody>
    </>
  );
}
