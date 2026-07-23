/**
 * Machine-readable brand constants — for places CSS variables can't reach
 * (e.g. `<meta name="theme-color">`, OG image generation, the PlugMark SVG,
 * chart palettes). Keep these in sync with tokens.css / Brand Guidelines v1.1.
 */
export const brand = {
  // Primary
  violet: "#7C3AED", // Brand Violet — primary
  violetDeep: "#5B21B6", // hover / dark
  violetTint: "#A78BFA", // accents / bg
  ink: "#12101C", // text / prongs / dark UI

  // Accent & surface
  lime: "#C6FF3D", // Electric Lime — fill only, dark text
  coral: "#FF6B5C", // warm alt
  violetWash: "#EFEAFB", // tint field
  canvas: "#F5F4F8", // page bg (light)

  // Aliases used across the app / meta tags.
  primary: "#7C3AED",
  accent: "#C6FF3D",
  surfaceDark: "#12101C", // dark page background (theme-color)
  surfaceLight: "#FFFFFF", // light page background (theme-color, Dev Spec)
} as const;

export type BrandColor = keyof typeof brand;
