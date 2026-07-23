import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmButton } from "@plugfolio/ui";

/**
 * UI Kit · ConfirmButton — a submit button that asks before firing, for
 * irreversible form actions (admin takedowns). Composes Button, so every
 * Button variant applies.
 */
const meta: Meta<typeof ConfirmButton> = {
  title: "UI Kit/ConfirmButton",
  component: ConfirmButton,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ConfirmButton>;

export const Takedown: Story = {
  render: () => (
    <form onSubmit={(event) => event.preventDefault()} className="flex gap-2">
      <ConfirmButton size="sm" variant="destructive" message="Delete this comment? This can't be undone.">
        Delete
      </ConfirmButton>
      <ConfirmButton size="sm" variant="ghost" message="Clear this product's coupon?">
        Clear coupon
      </ConfirmButton>
    </form>
  ),
};
