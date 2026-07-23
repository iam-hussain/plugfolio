import type { Meta, StoryObj } from "@storybook/react";
import { Input, Label } from "@plugfolio/ui";

/**
 * UI Kit · Input — label above, muted helper, inline error line (Dev Spec §03).
 */
function Field() {
  return (
    <div className="flex w-[320px] flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-url">Product URL</Label>
        <Input id="product-url" placeholder="store.com/knit-throw" />
        <p className="text-muted-foreground text-xs">We grab the title, image &amp; price.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite">Invite a manager</Label>
        <Input id="invite" placeholder="you@studio" aria-invalid />
        <p role="alert" className="text-destructive text-xs">
          Enter a valid email address.
        </p>
      </div>
    </div>
  );
}

const meta: Meta<typeof Field> = {
  title: "UI Kit/Input",
  component: Field,
  parameters: { layout: "centered" },
};
export default meta;

export const Fields: StoryObj<typeof Field> = {};
