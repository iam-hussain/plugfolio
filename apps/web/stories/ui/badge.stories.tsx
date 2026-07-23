import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@plugfolio/ui";

/**
 * UI Kit · Badge — status + tags (Dev Spec §03): Agreed / Negotiating,
 * "· manager", "tracked", "Their own product".
 */
const meta: Meta<typeof Badge> = {
  title: "UI Kit/Badge",
  component: Badge,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Statuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Agreed</Badge>
      <Badge variant="secondary">Negotiating</Badge>
      <Badge variant="outline">· manager</Badge>
      <Badge variant="outline">tracked</Badge>
      <Badge variant="secondary">Their own product</Badge>
    </div>
  ),
};
