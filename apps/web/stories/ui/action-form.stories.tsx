import type { Meta, StoryObj } from "@storybook/react";
import { ActionForm, Button, Toaster } from "@plugfolio/ui";

/**
 * ActionForm — an inline form around a result-returning server action that
 * fires its own success/error toast. For one-click mutations that need no
 * confirmation dialog: resend a verification email, flip a flag, resolve a
 * report. Anything destructive wants `ConfirmDialog` instead.
 *
 * The point of the shape is that the *caller* never handles the result: the
 * action returns `{ ok }` or `{ ok: false, error }`, and the toast is decided
 * here. That's what stops each of thirty admin buttons inventing its own
 * error copy.
 *
 * These stories use fake actions with a short delay so the toasts are real.
 */
const meta: Meta<typeof ActionForm> = {
  title: "UI Kit/Action form",
  component: ActionForm,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ActionForm>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Succeeds: Story = {
  args: {
    successToast: "Verification email sent.",
    action: async () => {
      await wait(400);
      return { ok: true as const };
    },
    children: <Button type="submit">Resend email</Button>,
  },
};

export const Fails: Story = {
  args: {
    action: async () => {
      await wait(400);
      return { ok: false as const, error: "That address bounced — check it and try again." };
    },
    children: (
      <Button type="submit" variant="secondary">
        Resend email
      </Button>
    ),
  },
};

/** Hidden fields ride along, so the row knows which record it acts on. */
export const WithHiddenFields: Story = {
  args: {
    successToast: "Report resolved.",
    hiddenFields: { reportId: "rep_8f21c0" },
    action: async () => {
      await wait(400);
      return { ok: true as const };
    },
    children: <Button type="submit">Resolve</Button>,
  },
};
