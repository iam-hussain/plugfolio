import type { Meta, StoryObj } from "@storybook/react";
import { Logo } from "@/components/brand";

/**
 * Brand · Logo — the four approved lockups (§03): horizontal (primary), stacked
 * (tiles/badges), symbol (avatars/favicons), reversed (dark UI). Never
 * re-space or re-typeset the wordmark; reuse this component.
 */
const meta: Meta<typeof Logo> = {
  title: "Brand/Logo",
  component: Logo,
  parameters: { layout: "centered" },
  argTypes: {
    layout: { control: "inline-radio", options: ["horizontal", "stacked", "symbol", "reversed"] },
    tone: { control: "inline-radio", options: ["onLight", "onDark", "violet"] },
  },
};
export default meta;
type Story = StoryObj<typeof Logo>;

export const Lockups: Story = {
  render: () => (
    <div className="bg-brand-ink grid grid-cols-2 gap-8 rounded-lg p-10 text-white">
      {(["horizontal", "stacked", "symbol", "reversed"] as const).map((layout) => (
        <div key={layout} className="flex flex-col items-center gap-3">
          <Logo layout={layout} tone="onDark" />
          <span className="tracking-eyebrow font-mono text-[10px] uppercase text-white/60">
            {layout}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const OnLight: Story = {
  render: () => (
    <div className="bg-brand-canvas text-brand-ink flex items-center justify-center rounded-lg p-10">
      <Logo layout="horizontal" tone="onLight" />
    </div>
  ),
};

export const Playground: Story = {
  args: { layout: "horizontal", tone: "onDark" },
  render: (args) => (
    <div className="bg-brand-ink flex items-center justify-center rounded-lg p-10 text-white">
      <Logo {...args} />
    </div>
  ),
};
