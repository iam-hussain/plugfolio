import type { Meta, StoryObj } from "@storybook/react";
// Import the leaf directly, not the chrome barrel — the barrel also pulls in
// AppTopBar → @/server/auth → env.ts, which validates env at module load.
import { ShopperTabBar } from "@/components/chrome/shopper-tab-bar";

/**
 * Chrome · Shopper tab bar (Dev Spec §03) — HOME / SHOP / FOLLOWING / ACCOUNT,
 * Space Mono labels, 20px line icons; the active tab renders in the accent.
 * Active follows the current route (the `pathname` param feeds the Storybook
 * next/navigation stub).
 */
const meta: Meta<typeof ShopperTabBar> = {
  title: "Chrome/Shopper tab bar",
  component: ShopperTabBar,
  parameters: { layout: "fullscreen", pathname: "/explore" },
  decorators: [
    (Story, context) => {
      // Feed the pathname to the next/navigation stub (globalThis.__SB_PATHNAME__).
      (globalThis as Record<string, unknown>).__SB_PATHNAME__ =
        (context.parameters.pathname as string) ?? "/";
      return (
        <div className="mx-auto w-[390px] max-w-full">
          <Story />
        </div>
      );
    },
  ],
};
export default meta;
type Story = StoryObj<typeof ShopperTabBar>;

// Active tab = SHOP (pathname /explore is a shopping surface).
export const ShopActive: Story = {};

export const HomeActive: Story = { parameters: { pathname: "/" } };

export const FollowingActive: Story = { parameters: { pathname: "/following" } };
