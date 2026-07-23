import type { Meta, StoryObj } from "@storybook/react";
import { Button, ConfirmDialog } from "@plugfolio/ui";

/**
 * UI Kit · ConfirmDialog — the Admin-design confirmation modal: tinted icon
 * box, consequence body, optional required-reason textarea or type-to-confirm
 * input, Cancel + tone-colored confirm.
 */
const meta: Meta<typeof ConfirmDialog> = {
  title: "UI Kit/ConfirmDialog",
  component: ConfirmDialog,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const PlainConfirm: Story = {
  render: () => (
    <ConfirmDialog
      trigger={
        <Button size="xs" variant="destructive-outline">
          Remove
        </Button>
      }
      title="Remove this post?"
      body="The post and its media come off Plugfolio. Tagged products stay live and recorded taps survive. This cannot be undone. Recorded in the audit log."
      confirmLabel="Remove post"
    />
  ),
};

export const WithRequiredReason: Story = {
  render: () => (
    <ConfirmDialog
      trigger={
        <Button size="xs" variant="destructive-outline">
          Suspend
        </Button>
      }
      title="Suspend member"
      body="They will be blocked from signing in and every profile they own is hidden from shoppers. Reversible — nothing is deleted. Recorded in the audit log."
      confirmLabel="Suspend"
      requireReason={{}}
    />
  ),
};

export const TypeToConfirm: Story = {
  render: () => (
    <ConfirmDialog
      trigger={
        <Button size="xs" variant="destructive">
          Delete account
        </Button>
      }
      title="Delete account"
      body="Permanently deletes this member and their profiles, posts, products, comments and follows. This cannot be undone."
      confirmLabel="Delete forever"
      requireMatch={{
        value: "@maya",
        note: "Deleted: profiles, posts, products, comments, follows. Surviving: recorded taps (as anonymous events).",
      }}
    />
  ),
};
