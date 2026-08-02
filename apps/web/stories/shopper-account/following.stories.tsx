import type { Meta, StoryObj } from "@storybook/react";
import type { FollowedCreator } from "@plugfolio/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FollowingPage } from "@/features/shopper-account";

/**
 * /following (DESIGN following.html) — the followed-creators list, grouped by
 * what's new since the account last looked. Not a feed: nothing merges anyone's
 * posts into a stream, and every route out goes to that creator's own page.
 *
 * The four states below are the ones that reshape the page. Chrome comes from
 * `ShopperShell` in the route, so the stories render the body alone.
 */
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

// Fixed clock so "6 days ago" is the same in every snapshot.
const NOW = new Date("2026-07-29T12:00:00Z");
const SINCE = new Date("2026-07-23T12:00:00Z");
const day = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

function creator(over: Partial<FollowedCreator> & { username: string }): FollowedCreator {
  return {
    id: over.username,
    displayName: null,
    avatarUrl: null,
    postCount: 12,
    productCount: 20,
    followedAt: day(120),
    lastPostAt: day(2),
    newPostCount: 0,
    ...over,
  };
}

const NEW: readonly FollowedCreator[] = [
  creator({
    username: "mayamoves",
    displayName: "Maya Rao",
    postCount: 18,
    productCount: 42,
    newPostCount: 4,
    followedAt: day(120),
  }),
  creator({
    username: "arjunbuilds",
    displayName: "Arjun Mehta",
    postCount: 24,
    productCount: 51,
    newPostCount: 2,
    followedAt: day(14),
  }),
  creator({
    username: "rheamakes",
    displayName: "Rhea Kapoor",
    postCount: 11,
    productCount: 20,
    newPostCount: 1,
    followedAt: day(240),
  }),
];

const QUIET: readonly FollowedCreator[] = [
  creator({
    username: "niaeveryday",
    displayName: "Nia Okafor",
    postCount: 6,
    productCount: 9,
    followedAt: day(3),
    lastPostAt: day(4),
  }),
  creator({
    username: "studiolane",
    displayName: "Studio Lane",
    postCount: 9,
    productCount: 14,
    followedAt: day(400),
    lastPostAt: day(95),
  }),
  creator({
    username: "foldandco",
    displayName: "Fold & Co",
    postCount: 3,
    productCount: 4,
    followedAt: day(420),
    lastPostAt: day(215),
  }),
];

const meta: Meta<typeof FollowingPage> = {
  title: "Shopper/Following",
  component: FollowingPage,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <QueryClientProvider client={client}>
        {/* Cancel the preview's global padding — the page owns its own gutter. */}
        <div className="-m-8">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    rows: [...NEW, ...QUIET],
    since: SINCE,
    now: NOW,
    search: "",
    sort: "new",
    page: 1,
    total: 6,
    followedTotal: 6,
    hasMore: false,
    pageSize: 20,
  },
};
export default meta;
type Story = StoryObj<typeof FollowingPage>;

/** The normal case — grouped into new, then everyone else. */
export const SomeNew: Story = {};

/** Nothing new: one group titled "Everyone you follow", and no panel saying
 *  so — the title and the per-row badges already do. */
export const AllCaughtUp: Story = {
  args: { rows: QUIET, total: 3, followedTotal: 3 },
};

/** More than one page — "Load 20 more" with the honest denominator. */
export const Paged: Story = {
  args: { hasMore: true, total: 128 },
};

/** Searched within your follows and found nobody. */
export const NoMatch: Story = {
  args: { rows: [], search: "zzz", total: 0, followedTotal: 128 },
};

/** The first-run state — the controls go with the list. */
export const FollowingNobody: Story = {
  args: { rows: [], total: 0, followedTotal: 0, since: null },
};
