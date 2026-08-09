import type { Meta, StoryObj } from "@storybook/react";
import { LandingPage } from "@/features/marketing/components/landing-page";
import { CodeChip, pill, RoleBadge } from "@/features/marketing/components/landing-bits";

/**
 * Landing · the Scroll V3 Dual scroll story (ADR-0027) — one page, three
 * sides. Scroll to drive the hero fade, the 420vh phone journey scrub, the
 * reveal bands and the count-up stats; the top-bar toggle and footer links
 * switch sides behind the lime+violet wipe. Reduced motion renders every
 * frame at its final state.
 */
const meta: Meta<typeof LandingPage> = {
  title: "Landing/Scroll story",
  component: LandingPage,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="-m-8">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof LandingPage>;

/** The default side — three taps from post to retailer, no account. */
export const Shopper: Story = { args: { defaultRole: "shopper" } };

/** The creator side — hour one live, the five-minute setup, honest numbers. */
export const Creator: Story = { args: { defaultRole: "creator" } };

/** The business side — brief to agreed in one thread, money never held. */
export const Business: Story = { args: { defaultRole: "business" } };

/** The landing's shared vocabulary: pill tones, the role badge, the code chip. */
export const Pieces: StoryObj = {
  render: () => (
    <div className="flex max-w-[560px] flex-col gap-6 p-8">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={pill({ tone: "violet", size: "md" })}>Buy</span>
        <span className={pill({ tone: "ink", size: "md" })}>Count the taps ↓</span>
        <span className={pill({ tone: "lime", size: "md" })}>Post a requirement</span>
      </div>
      <div className="bg-brand-violet rounded-card flex flex-wrap items-center gap-2.5 p-6">
        <span className={pill({ tone: "outlineLight", size: "md" })}>I&rsquo;m a creator →</span>
        <RoleBadge>For shoppers</RoleBadge>
      </div>
      <div className="flex items-center gap-2">
        <CodeChip code="MAYA10" />
        <span className="text-faint text-nano">Valid till 30 Aug · tap to copy</span>
      </div>
    </div>
  ),
};
