import path from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Storybook for the Plugfolio design system — a gallery of the brand mark, the
 * persistent chrome, and the themed UI kit. Hosted in apps/web (the one place
 * that can import @plugfolio/ui and the app's brand/chrome/feature components).
 *
 * Uses the Vite framework with small next/* stubs so components that reach for
 * next/link, next/image, next/navigation, or next/font render outside a Next
 * runtime (the @storybook/nextjs webpack framework conflicts with Next 15.5).
 */
const stub = (file: string) => path.resolve(process.cwd(), ".storybook/stubs", file);

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-themes"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  async viteFinal(base) {
    return mergeConfig(base, {
      plugins: [tsconfigPaths()],
      // The app tsconfig sets jsx: "preserve" (Next's requirement), which leaks
      // into esbuild and emits classic-runtime JSX. Force the automatic runtime
      // so stories don't need an explicit React import.
      esbuild: { jsx: "automatic", jsxImportSource: "react" },
      resolve: {
        alias: {
          "next/link": stub("next-link.tsx"),
          "next/image": stub("next-image.tsx"),
          "next/navigation": stub("next-navigation.ts"),
          "next/font/google": stub("next-font-google.ts"),
        },
      },
    });
  },
};

export default config;
