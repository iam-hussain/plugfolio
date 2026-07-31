import type { Meta, StoryObj } from "@storybook/react";
import { Button, SystemMark, SystemScreen } from "@plugfolio/ui";

/**
 * The system screens (DESIGN 404.html / error.html / system.html §.sys).
 *
 * One quiet mark, a Sora headline, a line of reassurance, and a row of
 * actions — the same skeleton for "not found" and "went wrong", so the two
 * read as one product rather than two companies.
 *
 * The copy rule these stories exist to hold: a shopper who hits one of these
 * has *not* lost their basket, because there is no basket — shopping is
 * account-free and settles at the retailer (§2.2). Neither screen should ever
 * imply otherwise, and neither offers "sign in" as the way out.
 */
const meta = {
  title: "UI Kit/System screen",
  component: SystemScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SystemScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotFound: Story = {
  args: {
    mark: <SystemMark state="unplugged" />,
    title: "That page has moved on",
    lede: "The handle might have changed, or the post came down. Everything else still works.",
    actions: (
      <>
        <Button>Explore creators</Button>
        <Button variant="secondary">Go home</Button>
      </>
    ),
  },
};

export const WentWrong: Story = {
  args: {
    mark: <SystemMark state="cracked" />,
    title: "Something went wrong on our side",
    lede: "Not you. Try again in a moment — nothing you were doing was lost.",
    actions: (
      <>
        <Button>Try again</Button>
        <Button variant="secondary">Go home</Button>
      </>
    ),
    children: <p className="text-faint text-micro mt-6 font-mono">Reference 8f21c0</p>,
  },
};

/** No actions — the shape still holds without a way forward to offer. */
export const Bare: Story = {
  args: {
    mark: <SystemMark state="unplugged" />,
    title: "Nothing here yet",
    lede: "This creator hasn't tagged anything so far.",
  },
};
