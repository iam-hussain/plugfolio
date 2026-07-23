import type { Meta, StoryObj } from "@storybook/react";
import { Pager } from "@plugfolio/ui";

/**
 * UI Kit · Pager — the Admin-design numbered pagination: showing-caption
 * left, prev / first · around-current · last / next right.
 */
const meta: Meta<typeof Pager> = {
  title: "UI Kit/Pager",
  component: Pager,
};
export default meta;
type Story = StoryObj<typeof Pager>;

export const MiddleOfManyPages: Story = {
  render: () => (
    <div className="w-[720px]">
      <Pager page={7} pageSize={25} total={4182} hrefFor={(p) => `?page=${p}`} />
    </div>
  ),
};

export const FirstPage: Story = {
  render: () => (
    <div className="w-[720px]">
      <Pager page={1} pageSize={25} total={88} hrefFor={(p) => `?page=${p}`} />
    </div>
  ),
};
