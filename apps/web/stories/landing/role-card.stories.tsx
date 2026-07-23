import type { Meta, StoryObj } from "@storybook/react";
import { RoleCard } from "@/features/landing";

/**
 * Landing · Role card — one door of the landing role router (Creator, Business,
 * Shopper). The whole card is a link; accent driven by variant through tokens.
 */
const meta: Meta<typeof RoleCard> = {
  title: "Landing/Role card",
  component: RoleCard,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[360px] max-w-full">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof RoleCard>;

export const Creator: Story = {
  args: {
    accent: "primary",
    kicker: "Creators",
    title: "Make your posts shoppable",
    description: "Connect your content, tag the products inside it, share one link.",
    cta: "Start selling",
    href: "/signin",
  },
};

export const Shopper: Story = {
  args: {
    accent: "accent",
    kicker: "Shoppers",
    title: "Browse a creator's shop",
    description: "No login, no friction — tap a post, see the product, buy in three taps.",
    cta: "Explore creators",
    href: "/explore",
  },
};
