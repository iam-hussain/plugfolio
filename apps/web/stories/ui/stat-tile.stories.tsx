import type { Meta, StoryObj } from "@storybook/react";
import { StatTile } from "@plugfolio/ui";

/**
 * UI Kit · StatTile — the dashboard count tile (admin dashboard & analytics):
 * mono uppercase eyebrow + big tabular number.
 */
const meta: Meta<typeof StatTile> = {
  title: "UI Kit/StatTile",
  component: StatTile,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof StatTile>;

export const Single: Story = {
  args: { label: "Taps · 7d", value: 312 },
};

export const DashboardGrid: Story = {
  render: () => (
    <div className="grid w-[560px] grid-cols-2 gap-4 md:grid-cols-4">
      <StatTile label="Members" value={128} />
      <StatTile label="Profiles" value={41} />
      <StatTile label="Taps · 7d" value={1204} />
      <StatTile label="Code copies · 7d" value={87} />
    </div>
  ),
};
