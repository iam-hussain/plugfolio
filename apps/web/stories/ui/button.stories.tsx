import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@plugfolio/ui";

/**
 * UI Kit · Button — the shadcn Button themed on our tokens. `accent` is the
 * disciplined Electric Lime CTA (the Buy button); `outline` is Follow.
 */
const meta: Meta<typeof Button> = {
  title: "UI Kit/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "accent", "outline", "ghost", "secondary", "destructive", "link"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "icon"] },
  },
  args: { children: "Button", variant: "primary", size: "md" },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Save</Button>
      <Button variant="accent">Buy</Button>
      <Button variant="outline">Follow</Button>
      <Button variant="ghost">Following</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Remove</Button>
      <Button variant="link">Learn more</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Busy: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button disabled>Opening…</Button>
      <Button variant="accent" disabled>
        Tagging…
      </Button>
    </div>
  ),
};
