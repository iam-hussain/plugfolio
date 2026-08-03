import type { Meta, StoryObj } from "@storybook/react";
// Import the leaf directly, not the chrome barrel — the barrel also pulls in
// AppTopBar → @/server/auth → env.ts, which validates env at module load.
import {
  PillNav,
  PillNavDivider,
  PillNavOverride,
  PillNavProvider,
  pillNavAction,
  pillNavActionQuiet,
  pillNavCircle,
} from "@/components/chrome/pill-nav";

/**
 * Chrome · Morphing pill nav (ADR-0026 §6) — one fixed ink pill that changes
 * contents by context: the five browse tabs by default; a page's own verbs
 * (Follow, Buy) via `PillNavOverride`. Active follows the current route (the
 * `pathname` param feeds the Storybook next/navigation stub).
 */
const meta: Meta<typeof PillNav> = {
  title: "Chrome/Pill nav",
  component: PillNav,
  parameters: { layout: "fullscreen", pathname: "/explore" },
  decorators: [
    (Story, context) => {
      (globalThis as Record<string, unknown>).__SB_PATHNAME__ =
        (context.parameters.pathname as string) ?? "/";
      return (
        <PillNavProvider>
          <div className="bg-background mx-auto h-[160px] w-[390px] max-w-full">
            <Story />
          </div>
        </PillNavProvider>
      );
    },
  ],
};
export default meta;
type Story = StoryObj<typeof PillNav>;

// Active tab = SHOP (pathname /explore).
export const Browse: Story = {};

export const HomeActive: Story = { parameters: { pathname: "/" } };

// A creator page morphs the pill into ← Explore · Follow · share.
export const CreatorMode: Story = {
  render: () => (
    <>
      <PillNavOverride>
        <span className="text-nav-foreground tracking-eyebrow flex items-center gap-2 pl-2 font-mono text-pico font-bold uppercase">
          ← Explore
        </span>
        <PillNavDivider />
        <button type="button" className={pillNavAction}>
          Follow Maya
        </button>
        <button type="button" aria-label="Share" className={pillNavCircle}>
          ↑
        </button>
      </PillNavOverride>
      <PillNav />
    </>
  ),
};

// A product page morphs it into ← back · save · Buy.
export const BuyMode: Story = {
  render: () => (
    <>
      <PillNavOverride>
        <button type="button" aria-label="Back" className={pillNavCircle}>
          ←
        </button>
        <button type="button" aria-label="Save" className={pillNavCircle}>
          ⌗
        </button>
        <button type="button" className={pillNavAction}>
          Buy at Nykaa Fashion
        </button>
      </PillNavOverride>
      <PillNav />
    </>
  ),
};

// The in-store-only quiet variant — no link to send you to.
export const BuyModeInStoreOnly: Story = {
  render: () => (
    <>
      <PillNavOverride>
        <button type="button" aria-label="Back" className={pillNavCircle}>
          ←
        </button>
        <button type="button" className={pillNavActionQuiet}>
          In-store only
        </button>
      </PillNavOverride>
      <PillNav />
    </>
  ),
};
