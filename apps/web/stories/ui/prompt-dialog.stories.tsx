import type { Meta, StoryObj } from "@storybook/react";
import { Button, PromptDialog } from "@plugfolio/ui";

/**
 * UI Kit · PromptDialog — the Admin-design modal asking for ONE value before
 * an action fires: tinted icon box, explanation, mono current → becomes
 * panel, prefilled editable input. Shown as the release-username flow.
 */
const meta: Meta<typeof PromptDialog> = {
  title: "UI Kit/PromptDialog",
  component: PromptDialog,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof PromptDialog>;

export const ReleaseUsername: Story = {
  render: () => (
    <PromptDialog
      trigger={
        <Button size="xs" variant="ghost-muted">
          Release username
        </Button>
      }
      title="Release username"
      description="Frees /gadget-guru for its rightful owner — the lever for impersonation, squatting, and handle disputes. The page stays live at the new address; nothing is deleted; the freed name is claimable immediately. Recorded in the audit log."
      current="/gadget-guru"
      becomes="/creator-4f9d21ab"
      label="New username for this page"
      name="username"
      defaultValue="creator-4f9d21ab"
      pattern="[a-z0-9][a-z0-9._-]{2,29}"
      patternHint="3–30 characters: lowercase letters, numbers, dots, dashes. Keep the suggestion or type your own."
      confirmLabel="Release & rename"
    />
  ),
};
