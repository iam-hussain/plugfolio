import type { Config } from "tailwindcss";

/**
 * Shared Tailwind preset for Plugfolio ("The Tagged Feed", DESIGN.md).
 *
 * Colors map to CSS variables defined in `@plugfolio/tokens` (tokens.css),
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
        // The six content-tile hues (DESIGN: colour lives in tiles, never in
        // chrome). `tile-foreground` is the ink/light text that rides on them.
        tile: {
          butter: "hsl(var(--tile-butter) / <alpha-value>)",
          mint: "hsl(var(--tile-mint) / <alpha-value>)",
          sky: "hsl(var(--tile-sky) / <alpha-value>)",
          lavender: "hsl(var(--tile-lavender) / <alpha-value>)",
          coral: "hsl(var(--tile-coral) / <alpha-value>)",
          blush: "hsl(var(--tile-blush) / <alpha-value>)",
          foreground: "hsl(var(--tile-foreground) / <alpha-value>)",
        },
        // Role signals — scoped by a `data-role` ancestor. `role-solid` is the
        // lighter tint (the auth top rail, soft washes); `role-deep` is the
        // saturated hue (accents, dots). Raw vars, no alpha channel.
        "role-solid": "var(--role-solid)",
        "role-deep": "var(--role-grad-a)",
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
      // Radius scale. Base steps (sm/md/lg/xl/panel/pill) serve app UI; the
      // named object steps (DESIGN §Shapes) climb with the object: paper 3 ·
      // image 16 · tile 20 · card 26 · bay 34. Anything interactive is a pill.
      // The design's container measure (--inner) — pages are 1200 wide with a
      // 20/40px gutter, not an ad-hoc max-w per page.
      maxWidth: {
        inner: "1200px",
        /* Long-form marketing sits a notch in from the page so a headline and
           a paragraph don't run the full width of the top bar above them. */
        narrow: "1080px",
        /* The reading measure. A thread, a brief, an email — anything whose
           job is a column of prose — is unreadable at `inner`, and every
           surface that needed one was inventing its own literal. Three named
           measures with a reason beats a different number on every screen. */
        reading: "760px",
      },
      transitionTimingFunction: {
        // The one easing the design uses everywhere (--ease).
        design: "cubic-bezier(.2,.8,.3,1)",
      },
      // The design's fixed type steps (--t-*). Named, because "13px" appearing
      // in forty class strings is exactly the magic value §8 forbids — and
      // because the design changes them in one place, so we should too.
      fontSize: {
        /* Below `micro` sit the two mono-uppercase tiers the design actually
           uses — table heads, stat captions, eyebrows, badge meta. They were
           living as `text-[10px]` / `text-[11px]` in fifty class strings; SI
           prefixes descend the same way the scale does (pico < nano < micro).
           Fill only — never body copy, which never goes below `label`. */
        pico: ["0.625rem", { lineHeight: "1.4" }],
        nano: ["0.6875rem", { lineHeight: "1.4" }],
        micro: ["0.75rem", { lineHeight: "1.4" }],
        label: ["0.8125rem", { lineHeight: "1.45" }],
        copy: ["0.9375rem", { lineHeight: "1.55" }],
        body: ["1.0625rem", { lineHeight: "1.5" }],
        title: ["1.375rem", { lineHeight: "1.2" }],
        name: ["1.5rem", { lineHeight: "1.05" }],
        "name-md": ["1.75rem", { lineHeight: "1.05" }],
        "name-lg": ["2rem", { lineHeight: "1.05" }],
        /* Fluid display steps. Headlines were carrying eight near-identical
           hand-written clamps across the auth, marketing, explore and account
           screens — the same magic value as `13px`, only harder to spot. Three
           named steps cover every one of them; a genuinely one-off hero (the
           landing wordmark line) still writes its own and says why. */
        "display-sm": ["clamp(1.5rem,3vw,2rem)", { lineHeight: "1.1" }],
        display: ["clamp(1.875rem,3.6vw,3rem)", { lineHeight: "1.05" }],
        "display-lg": ["clamp(2rem,4vw,2.75rem)", { lineHeight: "1.05" }],
        /* The two marketing heroes: a section-leading page headline, and the
           landing wordmark line — the single biggest type on the site. */
        "display-xl": ["clamp(2.25rem,5vw,3.5rem)", { lineHeight: "1.04" }],
        "display-2xl": ["clamp(2.25rem,6.2vw,5rem)", { lineHeight: "1.02" }],
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "var(--radius)",
        xl: "1.25rem",
        panel: "0.875rem",
        pill: "9999px",
        paper: "3px",
        image: "1rem", // 16px
        tile: "1.25rem", // 20px
        card: "1.625rem", // 26px
        bay: "2.125rem", // 34px
        // A shape nested inside an image-radius box sits 3px tighter, so the
        // gap between the two curves stays even (--r-nest).
        nest: "0.8125rem", // 13px
      },
      boxShadow: {
        // The soft, diffuse elevation vocabulary (DESIGN §Elevation): every
        // shadow carries an offset and a wide low-opacity blur in ink.
        rest: "0 12px 30px -12px hsl(var(--brand-ink) / 0.16)", // cards & panels at rest
        tag: "0 4px 12px -2px hsl(var(--brand-ink) / 0.22)", // tag pills on busy imagery
        lift: "0 22px 44px -16px hsl(var(--brand-ink) / 0.24)", // hover: lift + de-rotate
        // App elevations retained for menus, dialogs, toasts.
        raise: "0 10px 26px 0 hsl(var(--brand-ink) / 0.08)",
        menu: "0 12px 30px 0 hsl(var(--brand-ink) / 0.18)",
        overlay: "0 14px 40px 0 hsl(var(--brand-ink) / 0.22)",
      },
      // The auth artefact pane's role gradient (stops in `--role-grad-*`,
      // scoped by a `data-role` container).
      backgroundImage: {
        "role-gradient": "linear-gradient(155deg, var(--role-grad-a), var(--role-grad-b))",
      },
      fontFamily: {
        // Sora = display / wordmark / headlines; Manrope = UI & body (with
        // tabular figures for prices); Space Mono = code / data where needed.
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
