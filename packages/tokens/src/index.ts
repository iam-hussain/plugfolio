/**
 * Machine-readable brand constants — for places CSS variables can't reach
 * (e.g. `<meta name="theme-color">`, OG image generation, the PlugMark SVG,
 * chart palettes). Keep these in sync with tokens.css / ADR-0026 /
 * docs/design/v2-visual-system.md.
 */
export const brand = {
  // Primary
  violet: "#7C3AED", // Brand Violet — the default accent
  violetDeep: "#5B21B6", // pressed
  violetTint: "#A78BFA", // accents / focus
  ink: "#12101C", // ink panels / text / shadow colour

  // Accent & status
  lime: "#C6FF3D", // Electric Lime — offer fill only, ink text
  coral: "#FF6B5C", // danger / warm alt (v2)
  forest: "#1C7A5C", // success (v2)
  violetWash: "#EFEAFB", // tint field
  canvas: "#FFFFFF", // Canvas — page ground (light, v2)

  // The five creator page accents (ADR-0026 §4).
  accentViolet: "#7C3AED",
  accentIndigo: "#3D4EE8",
  accentCoral: "#FF6B5C",
  accentForest: "#1C7A5C",
  accentMagenta: "#C4247E",

  // DEPRECATED tile hues — admin-only (ADR-0026 §3).
  butter: "#FFD84D",
  mint: "#96E6BC",
  sky: "#A9D8FF",
  lavender: "#C9B6FF",
  blush: "#FFC9DE",

  // Aliases used across the app / meta tags.
  primary: "#7C3AED",
  accent: "#C6FF3D",
  surfaceDark: "#16141F", // dark page ground (theme-color, v2)
  surfaceLight: "#FFFFFF", // light page ground / Canvas (theme-color, v2)
} as const;

export type BrandColor = keyof typeof brand;
