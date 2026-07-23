import type { Config } from "tailwindcss";
import preset from "@plugfolio/config/tailwind";

const config: Config = {
  presets: [preset],
  content: [
    "./src/**/*.{ts,tsx}",
    // Storybook stories (design-system gallery) use their own utility classes.
    "./stories/**/*.{ts,tsx}",
    "./.storybook/**/*.{ts,tsx}",
    // Scan the shared UI kit so its Tailwind classes are generated.
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;
