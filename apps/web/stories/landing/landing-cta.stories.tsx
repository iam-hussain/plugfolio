import type { Meta, StoryObj } from "@storybook/react";
import { LandingCta } from "@/features/landing";

/**
 * Landing · CTA — the pill call-to-action used across the landing. Solid =
 * primary violet with a soft glow; outline = bordered; accent = lime.
 */
const meta: Meta<typeof LandingCta> = {
  title: "Landing/CTA",
  component: LandingCta,
  parameters: { layout: "centered" },
  args: { href: "/explore", children: "Explore creators →" },
  argTypes: {
    tone: { control: "inline-radio", options: ["solid", "outline", "accent"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
};
export default meta;
type Story = StoryObj<typeof LandingCta>;

export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <LandingCta {...args} tone="solid">
        Explore creators →
      </LandingCta>
      <LandingCta {...args} tone="outline">
        Browse products
      </LandingCta>
      <LandingCta {...args} tone="accent">
        Buy
      </LandingCta>
    </div>
  ),
};

export const Playground: Story = {};
