import type { Meta, StoryObj } from "@storybook/react";
import { Button, PromptDialog } from "@plugfolio/ui";

/**
 * UI Kit · PromptDialog — a modal that asks for ONE value before an action
 * fires: explanation, optional context block, a prefilled suggestion the user
 * can accept or replace. Shown here as the admin's release-username flow.
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
        <Button size="sm" variant="ghost">
          Release username
        </Button>
      }
      title="Release username"
      description={
        <>
          Frees <span className="font-mono">/gadget-guru</span> for its rightful owner. The page
          stays live at the new address and nothing is deleted; the freed name becomes claimable
          the moment you confirm. Recorded in the audit log.
        </>
      }
      label="New username for this page"
      name="username"
      defaultValue="creator-4f9d21ab"
      pattern="[a-z0-9][a-z0-9._-]{2,29}"
      patternHint="3–30 characters: lowercase letters, numbers, dots, dashes. Keep the suggestion or type your own."
      confirmLabel="Release & rename"
      confirmVariant="destructive"
    >
      <div className="bg-muted rounded-md p-3 text-sm">
        <p className="text-muted-foreground text-xs">Current</p>
        <p className="font-mono">/gadget-guru</p>
        <p className="text-muted-foreground mt-2 text-xs">Becomes</p>
        <p className="font-mono">/creator-4f9d21ab — or the name you enter below</p>
      </div>
    </PromptDialog>
  ),
};
