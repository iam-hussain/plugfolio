import type { Meta, StoryObj } from "@storybook/react";
import { PlugMark } from "@/components/brand";

/**
 * Brand · PlugMark — the two-prong "plug that grows" symbol. Color follows the
 * locked background rule (§02): on light = violet body + ink prongs; on dark =
 * white body + lime prongs. Under 24px, use the flat single-color variant.
 */
const meta: Meta<typeof PlugMark> = {
  title: "Brand/PlugMark",
  component: PlugMark,
  parameters: { layout: "centered" },
  argTypes: {
    tone: { control: "inline-radio", options: ["onLight", "onDark", "violet", "flat"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl", "2xl"] },
  },
};
export default meta;
type Story = StoryObj<typeof PlugMark>;

export const OnDark: Story = {
  args: { tone: "onDark", size: "2xl" },
  render: (args) => (
    <div className="bg-brand-ink flex size-40 items-center justify-center rounded-lg">
      <PlugMark {...args} />
    </div>
  ),
};

export const OnLight: Story = {
  args: { tone: "onLight", size: "2xl" },
  render: (args) => (
    <div className="bg-brand-canvas flex size-40 items-center justify-center rounded-lg">
      <PlugMark {...args} />
    </div>
  ),
};

export const OnViolet: Story = {
  args: { tone: "violet", size: "2xl" },
  render: (args) => (
    <div className="bg-brand-violet flex size-40 items-center justify-center rounded-lg">
      <PlugMark {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="bg-brand-ink flex items-end gap-4 rounded-lg p-6">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <PlugMark tone="onDark" size={size} />
          <span className="tracking-eyebrow font-mono text-[10px] uppercase text-white/70">
            {size}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Playground: Story = {
  args: { tone: "onDark", size: "2xl" },
  render: (args) => (
    <div className="bg-brand-ink flex size-40 items-center justify-center rounded-lg">
      <PlugMark {...args} />
    </div>
  ),
};
