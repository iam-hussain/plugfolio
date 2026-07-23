import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback } from "@plugfolio/ui";

/**
 * UI Kit · Avatar — 80px on the creator header, 28px in the top-bar account
 * slot; placeholder disc with an initial when there's no image.
 */
const meta: Meta<typeof Avatar> = {
  title: "UI Kit/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <Avatar className="border-border size-20 border">
        <AvatarFallback className="bg-muted text-muted-foreground font-display text-2xl">
          A
        </AvatarFallback>
      </Avatar>
      <Avatar className="size-8">
        <AvatarFallback className="bg-muted text-foreground text-xs">A</AvatarFallback>
      </Avatar>
    </div>
  ),
};
