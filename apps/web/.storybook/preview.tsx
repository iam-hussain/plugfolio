import * as React from "react";
import type { Preview } from "@storybook/react";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import "../src/app/globals.css";

/**
 * Preview: theme toggle (data-theme on <html> so token overrides apply) plus a
 * page-surface wrapper. Brand webfonts are loaded in preview-head.html and
 * bound to --font-sora/-inter/-space-mono, which the tokens read.
 */
const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: {
        order: ["Foundations", "Brand", "UI Kit", "Chrome", "Creator page", "Landing"],
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { dark: "dark", light: "light" },
      defaultTheme: "dark",
      attributeName: "data-theme",
    }),
    (Story) => (
      <div className="bg-background text-foreground font-sans">
        <div className="p-8">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default preview;
