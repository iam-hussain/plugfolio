import type { Config } from "tailwindcss";

/**
 * Shared Tailwind preset for Plugfolio (§7 "Charged Violet").
 *
 * Colors map to CSS variables defined in `@plugfolio/tokens` (styles/tokens.css),
 * so components reference semantic tokens — never raw hex. Both the web app and
 * the UI package extend this preset and point `content` at their own sources.
 */
const preset = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (values live in tokens.css as HSL channels).
        background: "hsl(var(--surface) / <alpha-value>)",
        foreground: "hsl(var(--text) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--color-primary) / <alpha-value>)",
          foreground: "hsl(var(--color-primary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--color-accent) / <alpha-value>)",
          foreground: "hsl(var(--color-accent-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--surface-muted) / <alpha-value>)",
          foreground: "hsl(var(--text-muted) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        // shadcn semantic names, aliased onto the same tokens so every
        // generated component themes from tokens.css without new values.
        card: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          foreground: "hsl(var(--text) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--surface-muted) / <alpha-value>)",
          foreground: "hsl(var(--text) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--surface-muted) / <alpha-value>)",
          foreground: "hsl(var(--text) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        input: "hsl(var(--border) / <alpha-value>)",
        sidebar: {
          DEFAULT: "hsl(var(--surface-muted) / <alpha-value>)",
          foreground: "hsl(var(--text) / <alpha-value>)",
          primary: "hsl(var(--color-primary) / <alpha-value>)",
          "primary-foreground": "hsl(var(--color-primary-foreground) / <alpha-value>)",
          accent: "hsl(var(--surface) / <alpha-value>)",
          "accent-foreground": "hsl(var(--text) / <alpha-value>)",
          border: "hsl(var(--border) / <alpha-value>)",
          ring: "hsl(var(--ring) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default preset;
