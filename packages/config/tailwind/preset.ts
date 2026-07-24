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
        // Third text tier (Admin design): timestamps, table eyebrows, hints.
        faint: "hsl(var(--text-faint) / <alpha-value>)",
        // Selected fill (Violet Wash on light) — nav-active, soft chips, sel-bar.
        active: "hsl(var(--surface-active) / <alpha-value>)",
        border: {
          DEFAULT: "hsl(var(--border) / <alpha-value>)",
          // Stronger hairline for inputs & secondary-button outlines.
          strong: "hsl(var(--border-strong) / <alpha-value>)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        // shadcn semantic names, aliased onto the same tokens so every
        // generated component themes from tokens.css without new values.
        // Cards/sheets are the RAISED surface (design: white / #1A1726),
        // one step off the page background.
        card: {
          DEFAULT: "hsl(var(--surface-muted) / <alpha-value>)",
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
        // Raw brand palette (Brand Guidelines v1.1 §05) — for the few spots that
        // need a specific brand color, e.g. the coral warm alt. Still tokens,
        // never raw hex in JSX. Lime is fill-only; use `accent` for it.
        brand: {
          violet: "hsl(var(--brand-violet) / <alpha-value>)",
          "violet-deep": "hsl(var(--brand-violet-deep) / <alpha-value>)",
          "violet-tint": "hsl(var(--brand-violet-tint) / <alpha-value>)",
          "violet-wash": "hsl(var(--brand-violet-wash) / <alpha-value>)",
          ink: "hsl(var(--brand-ink) / <alpha-value>)",
          lime: "hsl(var(--brand-lime) / <alpha-value>)",
          coral: "hsl(var(--brand-coral) / <alpha-value>)",
          canvas: "hsl(var(--brand-canvas) / <alpha-value>)",
        },
        sidebar: {
          // Admin design: the rail sits on the page surface (white / #161320-ish).
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          foreground: "hsl(var(--text) / <alpha-value>)",
          primary: "hsl(var(--color-primary) / <alpha-value>)",
          "primary-foreground": "hsl(var(--color-primary-foreground) / <alpha-value>)",
          // Selected fill: Violet Wash + violet text (Admin design nav-active).
          accent: "hsl(var(--surface-active) / <alpha-value>)",
          "accent-foreground": "hsl(var(--color-primary) / <alpha-value>)",
          border: "hsl(var(--border) / <alpha-value>)",
          ring: "hsl(var(--ring) / <alpha-value>)",
        },
      },
      // Bare `border`/`border-b`/`divide-*` (no color suffix) must resolve to
      // the token, not Tailwind's gray-200 default — in dark mode that default
      // renders glaring light hairlines (shadcn table rows use bare border-b).
      borderColor: {
        DEFAULT: "hsl(var(--border) / <alpha-value>)",
      },
      // Radius scale — Brand/Dev-spec §02: sm 8 · md 12 · lg 16 · pill 999.
      // `panel` (14px) is the Admin design's card radius.
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "var(--radius)",
        xl: "1.25rem",
        panel: "0.875rem",
        pill: "9999px",
      },
      boxShadow: {
        // Admin design elevations: hovered tiles, menus/dialogs, toasts.
        raise: "0 10px 26px 0 hsl(var(--brand-ink) / 0.08)",
        menu: "0 12px 30px 0 hsl(258 33% 5% / 0.18)",
        overlay: "0 14px 40px 0 hsl(258 33% 5% / 0.22)",
      },
      fontFamily: {
        // Sora = display / wordmark / headlines; Inter = UI & body;
        // Space Mono = micro labels, eyebrows, captions.
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        // Sora tracks tight at display sizes (-2% to -5%); Space Mono eyebrows
        // track wide (0.12–0.18em).
        display: "-0.03em",
        eyebrow: "0.14em",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default preset;
