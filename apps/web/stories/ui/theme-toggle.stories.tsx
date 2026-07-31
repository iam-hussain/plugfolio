import type { Meta, StoryObj } from "@storybook/react";
import { ThemeToggle } from "@plugfolio/ui";

/**
 * ThemeToggle — flips `data-theme` on `<html>` and persists the choice in a
 * cookie, so the *server* renders the right theme on the next request rather
 * than flashing the wrong one and correcting it on hydration.
 *
 * Light is committed (the `:root` default) and dark is fully supported through
 * the same tokens (§7), which is exactly why this control has to exist: every
 * component has to hold AA in both, and this is how you check.
 *
 * The story reads the same `data-theme` attribute the preview's theme switcher
 * writes, so the toolbar toggle and this control drive one another.
 */
const meta = {
  title: "UI Kit/Theme toggle",
  component: ThemeToggle,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Seeded from the server's cookie read. Without `initialTheme` the button can
 * only learn the theme after hydration, so it paints a moon on a dark page and
 * corrects itself a beat later — a wrong-icon flash on every page load. Both
 * apps pass it; the prop stays optional so the effect remains the fallback.
 */
export const SeededDark: Story = {
  args: { initialTheme: "dark" },
};

/** In place: the top-bar cluster it actually lives in. */
export const InATopBar: Story = {
  args: {},
  render: () => (
    <div className="border-border bg-card rounded-pill flex items-center gap-2 border px-3 py-2">
      <span className="text-muted-foreground text-micro font-bold uppercase tracking-[0.06em]">
        Appearance
      </span>
      <ThemeToggle />
    </div>
  ),
};
