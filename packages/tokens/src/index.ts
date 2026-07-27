/**
 * Machine-readable brand constants — for places CSS variables can't reach
 * (e.g. `<meta name="theme-color">`, OG image generation, the PlugMark SVG,
 * chart palettes). Keep these in sync with tokens.css / DESIGN.md.
 */
export const brand = {
  // Primary
  violet: "#7C3AED", // Brand Violet — primary
  violetDeep: "#5B21B6", // hover / pressed
  violetTint: "#A78BFA", // accents / focus
  ink: "#12101C", // text / shadow colour

  // Accent & surface
  lime: "#C6FF3D", // Electric Lime — fill only, ink text
  coral: "#FF8A73", // warm alt (DESIGN departure)
  violetWash: "#EFEAFB", // tint field
  canvas: "#FCFBFE", // Canvas — page ground (light)

  // The six content-tile hues (DESIGN §Colors).
  butter: "#FFD84D",
  mint: "#96E6BC",
  sky: "#A9D8FF",
  lavender: "#C9B6FF",
  blush: "#FFC9DE",

  // Aliases used across the app / meta tags.
  primary: "#7C3AED",
  accent: "#C6FF3D",
  surfaceDark: "#14121C", // dark page ground (theme-color)
  surfaceLight: "#FCFBFE", // light page ground / Canvas (theme-color)
} as const;

export type BrandColor = keyof typeof brand;
