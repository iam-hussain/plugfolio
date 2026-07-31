import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton, SkeletonScreen } from "@plugfolio/ui";

/**
 * Loading placeholders. Two rules govern every use, and these stories exist to
 * make breaking either of them visible:
 *
 * 1. **A skeleton is the SHAPE of what's coming.** It reserves the space the
 *    real content will take, so the page doesn't jump when it arrives. A
 *    generic circle-and-two-bars in front of a four-column grid is worse than
 *    a spinner — it promises a layout, then breaks it. `Generic` below is the
 *    anti-pattern; `CreatorPage` is the same wait done right.
 * 2. **Bones are decorative.** They're `aria-hidden`, and the surrounding
 *    `SkeletonScreen` announces the wait once, naming *the thing* ("Loading
 *    this creator's page") rather than the act — a screen-reader user who
 *    hears only "Loading" on every navigation learns nothing about where they
 *    have arrived. Check the a11y panel on each story.
 *
 * The pulse stops under `prefers-reduced-motion`: an infinite pulse is a
 * vestibular trigger, and on a slow connection it can run for a while.
 */
const meta = {
  title: "UI Kit/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The creator page, while it streams — cover, identity, chips, then the wall. */
export const CreatorPage: Story = {
  args: {},
  render: () => (
    <SkeletonScreen label="Loading this creator's page" className="w-[min(720px,90vw)]">
      <Skeleton className="rounded-bay h-32 w-full" />
      <div className="mt-5 flex items-center gap-3.5">
        <Skeleton className="size-16 shrink-0 rounded-pill" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3.5 w-56" />
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        {[72, 96, 64, 88].map((w) => (
          <Skeleton key={w} className="rounded-pill h-10 shrink-0" style={{ width: w }} />
        ))}
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="rounded-card aspect-square w-full" />
        ))}
      </div>
    </SkeletonScreen>
  ),
};

/** A follow list is a column of rows, so its skeleton is too. */
export const FollowingList: Story = {
  args: {},
  render: () => (
    <SkeletonScreen label="Loading the creators you follow" className="w-[min(560px,90vw)]">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="border-border flex items-center gap-3 border-b py-3.5">
          <Skeleton className="size-11 shrink-0 rounded-pill" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-1.5 h-3 w-48" />
          </div>
          <Skeleton className="rounded-pill h-9 w-20 shrink-0" />
        </div>
      ))}
    </SkeletonScreen>
  ),
};

/**
 * The anti-pattern, kept on purpose. This is what rule 1 forbids: bones that
 * describe no real screen, in front of a grid. Compare it with `CreatorPage`.
 */
export const Generic: Story = {
  args: {},
  render: () => (
    <SkeletonScreen label="Loading" className="w-[min(560px,90vw)]">
      <Skeleton className="size-12 rounded-pill" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </SkeletonScreen>
  ),
};
