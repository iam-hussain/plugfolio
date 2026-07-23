import type { Meta, StoryObj } from "@storybook/react";
import { Wordmark } from "@/components/brand";

/**
 * Brand · Wordmark — lowercase `plugfolio` in Sora 700 with a square spark dot.
 * The spark follows the locked rule: violet on light, lime on dark.
 */
const meta: Meta<typeof Wordmark> = {
  title: "Brand/Wordmark",
  component: Wordmark,
  parameters: { layout: "centered" },
  argTypes: { tone: { control: "inline-radio", options: ["onLight", "onDark", "violet"] } },
};
export default meta;
type Story = StoryObj<typeof Wordmark>;

export const OnDark: Story = {
  args: { tone: "onDark" },
  render: (args) => (
    <div className="bg-brand-ink flex items-center justify-center rounded-lg p-8 text-white">
      <Wordmark {...args} className="text-3xl" />
    </div>
  ),
};

export const OnLight: Story = {
  args: { tone: "onLight" },
  render: (args) => (
    <div className="bg-brand-canvas text-brand-ink flex items-center justify-center rounded-lg p-8">
      <Wordmark {...args} className="text-3xl" />
    </div>
  ),
};
