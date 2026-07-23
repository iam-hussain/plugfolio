import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@plugfolio/ui";

/**
 * UI Kit · Card — the raised surface (--surface-muted), radius-lg, 1px border.
 * Used for earnings, briefs, and product rows.
 */
const meta: Meta<typeof Card> = {
  title: "UI Kit/Card",
  component: Card,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Earnings: Story = {
  render: () => (
    <Card className="w-[320px]">
      <CardHeader>
        <CardTitle>Earnings</CardTitle>
        <CardDescription>Outbound taps · tracked</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-display text-4xl font-bold tabular-nums">1,284</p>
        <p className="text-muted-foreground mt-1 text-sm">outbound taps · tracked</p>
      </CardContent>
    </Card>
  ),
};
