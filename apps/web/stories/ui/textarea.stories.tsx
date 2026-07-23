import type { Meta, StoryObj } from "@storybook/react";
import { Label, Textarea } from "@plugfolio/ui";

/**
 * UI Kit · Textarea — multi-line input (admin reserved-usernames editor,
 * collab briefs). Mono where the content is code-like.
 */
const meta: Meta<typeof Textarea> = {
  title: "UI Kit/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="reserved">Reserved usernames</Label>
      <Textarea id="reserved" rows={5} className="font-mono" defaultValue={"vip\nwinner\ngiveaway"} />
    </div>
  ),
};
